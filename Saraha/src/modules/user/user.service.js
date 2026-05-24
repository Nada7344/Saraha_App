import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  USER_ACCESS_TOKEN_SECRET_KEY,
} from "../../../config/config.service.js";
import { LogoutEnum, TokenTypeEnum } from "../../common/enums/security.enum.js";
import {
  allKeysByPrefix,
  deleteKey,
  revokeTokenKey,
  revokeTokenKeyPrefix,
  set,
} from "../../common/services/redis.service.js";
import {
  compareHash,
  ConflictException,
  createLoginCredentials,
  generateDecryption,
  generateHash,
  NotFoundException,
} from "../../common/utils/index.js";
import { create, deleteMany, findOne } from "../../DB/database.repository.js";
import { TokenModel, UserModel } from "../../DB/index.js";

const createRevokeToken = async ({ userId, jti, ttl }) => {
  await set({
    key: revokeTokenKey({ userId, jti }),
    value: jti,
    ttl,
  });

  return;
};

export const logout = async ({ flag }, user, { jti, iat }) => {
  let status = 200;
  switch (flag) {
    case LogoutEnum.All:
      user.changeCredentialTime = new Date();
      await user.save();
      await deleteKey({
        key: await allKeysByPrefix({
          prefix: revokeTokenKeyPrefix({ userId: user._id }),
        }),
      });
      break;

    default:
      await createRevokeToken({
        userId: user._id,
        jti,
        ttl: iat + REFRESH_TOKEN_EXPIRES_IN,
      });
      status = 201;
      break;
  }

  return status;
};

export const profile = async (user) => {
  const decryptedPhon = await generateDecryption(user.phone);
  user.phone = decryptedPhon;
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

export const updatePassword = async (
  { oldPassword, password },
  user,
  issuer,
) => {
  if (
    !(await compareHash({ plaintext: oldPassword, ciphertext: user.password }))
  ) {
    throw ConflictException({ message: "invalid old password" });
  }

  user.password = await generateHash({ plaintext: password });
  user.changeCredentialTime = new Date();
  await user.save();
  
  await deleteKey({
    key: await allKeysByPrefix({
      prefix: revokeTokenKeyPrefix({ userId: user._id }),
    }),
  });
  return await createLoginCredentials(user, issuer);
};

export const profileImage = async (user, file) => {
  user.profilePicture = file.finalPath;
  await user.save();
  return user;
};

export const profileCoverImages = async (user, file) => {
  user.coverProfilePicture = file.map((file) => file.finalPath);
  await user.save();
  return user;
};

export const rotateToken = async (user, { jti, iat }, issuer) => {
  if ((iat + ACCESS_TOKEN_EXPIRES_IN) * 1000 >= Date.now() + 30000) {
    throw ConflictException({
      message: "Current access token is still valid ",
    });
  }
  await createRevokeToken({
    userId: user._id,
    jti,
    ttl: iat + REFRESH_TOKEN_EXPIRES_IN,
  });
  return await createLoginCredentials(user, issuer);
};
