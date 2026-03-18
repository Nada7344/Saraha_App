import { compare } from "bcrypt";
import {
  createLoginCredentials,
  generateDecryption,
  generateEncryption,
} from "../../common/utils/index.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/utils/response/error.response.js";
import { generateHash } from "../../common/utils/security/hash.security.js";
import { create, findOne, UserModel } from "../../DB/index.js";
import {OAuth2Client} from 'google-auth-library';
import { ProviderEnum } from "../../common/enums/user.enum.js";

const verifyGoogleAccount = async(idToken)=>{
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
      idToken,
      audience: "761439819147-2fjcte85g48umcionqpe593vi3q8diog.apps.googleusercontent.com", 
  });
  const payload = ticket.getPayload();
  return payload ;
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
  return user;
};

export const login = async (inputs,issuer) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email , provider : ProviderEnum.System},
  });
  if (!user) {
    throw NotFoundException({ message: "invalid login credentials" });
  }
  const match = await compare(password, user.password);
  if (!match) {
    throw NotFoundException({ message: "invalid login credentials" });
  }

return createLoginCredentials(user ,issuer);
};


export const signupWithGmail = async (idToken ,issuer)=>{
const payload = await verifyGoogleAccount(idToken);
console.log({payload}); 
  const checkUserExist = await findOne({
    filter: { email:payload.email },
    model: UserModel,
  });

if(checkUserExist){
    if(checkUserExist.provider != ProviderEnum.Google){
    throw ConflictException({message:"invalid login provider"})
  }
  return{status:200 ,credentials : await loginWithGmail(idToken,issuer)};
}

 const user = await create({
    model: UserModel,
    data: [
      {
        firstName :payload.given_name,
        lastName :payload.family_name,
        email:payload.email,
       profilePicture:payload.profilePicture,
       confirmEmail:new Date(),
       provider:ProviderEnum.Google
      },
    ],
  });
  return {status:201,credentials :await createLoginCredentials(user ,issuer)};

};
 

export const loginWithGmail = async (idToken ,issuer)=>{
const payload = await verifyGoogleAccount(idToken);
console.log({payload}); 
  const user = await findOne({
    filter: { email:payload.email , provider : ProviderEnum.Google },
    model: UserModel,
  });

if(!user){
   
    throw NotFoundException({message:"Not regester account"})

}

return await createLoginCredentials(user ,issuer);

};
