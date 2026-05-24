import { compare } from "bcrypt";
import {
  createLoginCredentials,
  createNumberOtp,
  emailEvent,
  generateDecryption,
  generateEncryption,
  sendEmail,
  verifyEmailTemplate,
} from "../../common/utils/index.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/utils/response/error.response.js";
import {
  compareHash,
  generateHash,
} from "../../common/utils/security/hash.security.js";
import { create, findOne, findOneAndUpdate, updateOne, UserModel } from "../../DB/index.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../common/enums/user.enum.js";
import { allKeysByPrefix, blockOtpKey, deleteKey, get, incr, maxAttempOtpKey, otpKey, revokeTokenKeyPrefix, set, ttl } from "../../common/services/redis.service.js";
import { SubjectEnum } from "../../common/enums/email.enum.js";

const verifyGoogleAccount = async (idToken) => {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "761439819147-2fjcte85g48umcionqpe593vi3q8diog.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  return payload;
};


const sendEmailOtp =async ({email ,subject ,title})=>{
  const isBlockTtl= await ttl({key :blockOtpKey({email , subject})})
   if (isBlockTtl>0) { 
    throw BadRequestException({ message: `sorry we cannot request new otp while current you are blocked please try again after ${isBlockTtl} second`});
  }


  const remainingOtpTtl= await ttl({ key: otpKey({ email , subject}) });
   if (remainingOtpTtl>0) { 
    throw BadRequestException({ message: `sorry we cannot request new otp while current otp still active please try again after ${remainingOtpTtl}`  });
  }

   const maxtrial= await get({ key: maxAttempOtpKey({ email ,subject}) });
   if (maxtrial>=3) { 
    await set ({
       key:blockOtpKey({ email ,subject}),
      value:1,
      ttl:420
    })
   throw BadRequestException({ message: `you have reached the max trail`  });

  }

  const code = createNumberOtp();
  await set({
    key: otpKey({ email ,subject}),
    value: await generateHash({ plaintext: `${code}` }),
    ttl: 120,
  });

  emailEvent.emit("SendEmail",async()=>{

     await sendEmail({
    to: email,
    subject: "Confirm-Email",
    html: verifyEmailTemplate({ code, title }),
  });
  await incr({key:maxAttempOtpKey({ email ,subject})})
  })
 
}



export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;

  const checkUserExist = await findOne({
    filter: { email },
    model: UserModel,
  });

  if (checkUserExist) {
    throw ConflictException({ message: "email already exist" });
  }
  const user = await create({
    model: UserModel,
    data: [
      {
        username,
        email,
        password: await generateHash({ plaintext: password }),
        phone: await generateEncryption(phone),
      },
    ],
  });

  await sendEmailOtp({email ,subject:SubjectEnum.ConfirmEmail ,title:"Verify Email"})
  return user;
};

export const confirmEmail = async (inputs) => {
  const { email, otp } = inputs;

  const account = await findOne({
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: ProviderEnum.System,
    },
    model: UserModel,
  });

  if (!account) {
    throw NotFoundException({ message: "fail to find matching account" });
  }

  const hashOtp = await get({ key: otpKey({ email ,subject:SubjectEnum.ConfirmEmail }) });
  if (!hashOtp) {
    throw NotFoundException({ message: "Expired otp" });
  }
  const verifyOtp = await compareHash({ plaintext: otp, ciphertext: hashOtp });
  if (!verifyOtp) {
    throw ConflictException({ message: "Invalid Otp" });
  }

  account.confirmEmail = new Date();
  await account.save();
  await deleteKey({key :await allKeysByPrefix(otpKey({email}))})
  return;
};

export const resendConfirmEmail = async (inputs) => {
  const { email } = inputs;

  const account = await findOne({
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: ProviderEnum.System,
    },
    model: UserModel,
  });

  if (!account) {
    throw NotFoundException({ message: "fail to find matching account" });
  }
  
    await sendEmailOtp({email ,subject:SubjectEnum.ConfirmEmail ,title:"Verify Email"})

  return;
};



export const login = async (inputs, issuer) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email, provider: ProviderEnum.System ,confirmEmail: { $exists: true}},
  });

  
  if (!user) {
    throw NotFoundException({ message: "invalid login credentials" });
  }
  const match = await compareHash({
    plaintext: password,
    ciphertext: user.password,
  });
  if (!match) {
    throw NotFoundException({ message: "invalid login credentials" });
  }

  return createLoginCredentials(user, issuer);
};


export const forgotPasswordOtp = async (inputs) => {
  const { email } = inputs;

  const account = await findOne({
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.System,
    },
    model: UserModel,
  });

  if (!account) {
    throw NotFoundException({ message: "fail to find matching account" });
  }
  
    await sendEmailOtp({email ,subject:SubjectEnum.ForgotPassword ,title:"Reset Code"})

  return;
};

export const verifyForgotPasswordOtp= async (inputs) => {
  const { email ,otp } = inputs;
  const hashOtp = await get({ key: otpKey({ email ,subject:SubjectEnum.ForgotPassword }) })
  if(!hashOtp){
    throw NotFoundException({message:"expired otp"})
  }
  if(!await compareHash({plaintext:otp ,ciphertext:hashOtp})){
    throw ConflictException({message:"invalid otp"})
  }

  return;
};


export const resetForgotPasswordOtp= async (inputs) => {
  const { email ,otp,password } = inputs;
  await verifyForgotPasswordOtp({email, otp})
  const user = await findOneAndUpdate({
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.System,
    },
    model: UserModel,
    update:{
      password:await generateHash({plaintext:password}),
     changeCredentialTime:new Date()
    }
  
  });

  if (!user.matchedCount) {
    throw NotFoundException({ message: "account not exist" });

  }
  const  tokenKeys=await allKeysByPrefix(revokeTokenKeyPrefix({userId:user._id}))
  const otpKeys =await allKeysByPrefix(otpKey({email ,subject:SubjectEnum.ForgotPassword}))
  await deleteKey({key :[...tokenKeys,...otpKeys]})
  return;
};


export const signupWithGmail = async (idToken, issuer) => {
  const payload = await verifyGoogleAccount(idToken);
  console.log({ payload });
  const checkUserExist = await findOne({
    filter: { email: payload.email },
    model: UserModel,
  });

  if (checkUserExist) {
    if (checkUserExist.provider != ProviderEnum.Google) {
      throw ConflictException({ message: "invalid login provider" });
    }
    return { status: 200, credentials: await loginWithGmail(idToken, issuer) };
  }

  const user = await create({
    model: UserModel,
    data: [
      {
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        profilePicture: payload.picture,
        confirmEmail: new Date(),
        provider: ProviderEnum.Google,
      },
    ],
  });
  return {
    status: 201,
    credentials: await createLoginCredentials(user, issuer),
  };
};

export const loginWithGmail = async (idToken, issuer) => {
  const payload = await verifyGoogleAccount(idToken);
  console.log({ payload });
  const user = await findOne({
    filter: { email: payload.email, provider: ProviderEnum.Google },
    model: UserModel,
  });

  if (!user) {
    throw NotFoundException({ message: "Not regester account" });
  }

  return await createLoginCredentials(user, issuer);
};
