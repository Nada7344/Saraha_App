import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import {
  createLoginCredentials,
  decodeToken,
  generateDecryption,
  NotFoundException,
} from "../../common/utils/index.js";
import { findOne } from "../../DB/database.repository.js";
import { UserModel } from "../../DB/index.js";

export const logout = async (user) => {
  user.changeCredentialTime = new Date()
  await user.save()
  return user
};

export const profile = async (user) => {
  return user;
};

export const shareProfile = async (userId) => {
  const account = await findOne({
    model: UserModel,
    filter: { _id: userId },
    select: "-password",
  });
  if (!account) {
    throw NotFoundException({ message: "invalid shared account" });
  }
  if (account.phone) {
    account.phone = await generateDecryption(account.phone);
  }
  return account;
};

export const profileImage = async (user,file) => {
  user.profilePicture=file.finalPath;
  await user.save();
  return user;
};


export const profileCoverImages = async (user,file) => {
  user.coverProfilePicture=file.map(file=>file.finalPath );
  await user.save();
  return user;
};

export const rotateToken = async (user, issuer) => {
  return await createLoginCredentials(user, issuer);
};
