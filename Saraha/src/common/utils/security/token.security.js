import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  SYSTEM_ACCESS_TOKEN_SECRET_KEY,
  SYSTEM_REFRESH_TOKEN_SECRET_KEY,
  USER_ACCESS_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../../../config/config.service.js";
import { TokenModel, UserModel, findOne } from "../../../DB/index.js";
import { TokenTypeEnum } from "../../enums/security.enum.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../response/error.response.js";
import { RoleEnum } from "../../enums/user.enum.js";
import {randomUUID} from 'node:crypto'
import { get, revokeTokenKey } from "../../services/redis.service.js";


export const generateToken = async ({
  paylaod = {},
  secret = USER_ACCESS_TOKEN_SECRET_KEY,
  options = {},
} = {}) => {
  return jwt.sign(paylaod, secret, options);
};

export const verifyToken = async (
  token = {},
  secret = USER_ACCESS_TOKEN_SECRET_KEY,
) => {
  return jwt.verify(token, secret);
};

export const detectSignatureLevel = async (level) => {
  let signatureLevel = undefined;
  switch (level) {
    case RoleEnum.Admin:
      signatureLevel = {
        accessSignature: SYSTEM_ACCESS_TOKEN_SECRET_KEY,
        refreshSignature: SYSTEM_REFRESH_TOKEN_SECRET_KEY,
      };
      break;

    default:
      signatureLevel = {
        accessSignature: USER_ACCESS_TOKEN_SECRET_KEY,
        refreshSignature: USER_REFRESH_TOKEN_SECRET_KEY,
      };
      break;
  }
  return signatureLevel;
};

export const getTokenSignature = async ({
  tokenType = TokenTypeEnum.Access,
  level,
} = {}) => {
  const { accessSignature, refreshSignature } =
    await detectSignatureLevel(level);
  let signature = undefined;
  switch (tokenType) {
    case TokenTypeEnum.Referesh:
      signature = refreshSignature;
      break;

    default:
      signature = accessSignature;
      break;
  }

  return signature;
};

export const decodeToken = async ({
  token,
  tokenType = TokenTypeEnum.Access,
} = {}) => {
  const decoded = jwt.decode(token);
  if (!decoded.aud?.length) {
    throw BadRequestException({ message: "Missing token audiance" });
  }

  const [TokenAprproach, level] = decoded.aud || [];
  if (tokenType !== TokenAprproach) {
    throw ConflictException({
      message: `Unexpected token mechanism we expected ${tokenType} while you have used ${TokenAprproach}`,
    });
  }

  if(decoded.jti && await get({key :revokeTokenKey({userId:decoded.sub ,jti:decoded.jti})})){
        throw UnauthorizedException({ message: "invalid login session" });

  }


  const secret = await getTokenSignature({ tokenType: TokenAprproach, level });
  const verifyedData = jwt.verify(token, secret);
  const user = await findOne({
    model: UserModel,
    filter: { _id: verifyedData.sub },
  });

  if (!user) {
    throw NotFoundException({ message: "Not Regester Account" });
  }

   if (user.changeCredentialTime && user.changeCredentialTime?.getTime()>= decoded.iat *1000) {
    throw UnauthorizedException({ message: "invalid login session" });
  }
  
  return{user ,decoded};
};

export const createLoginCredentials = async (user, issuer) => {
  const { accessSignature, refreshSignature } = await detectSignatureLevel(
    user.role,
  );
  const jwtid =randomUUID()
  const access_token = await generateToken({
    paylaod: { sub: user._id },
    secret: accessSignature,
    options: {
      issuer: issuer,
      audience: [TokenTypeEnum.Access, user.role],
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      jwtid
    },
  });

  const refresh_token = await generateToken({
    paylaod: { sub: user._id },
    secret: refreshSignature,

    options: {
      issuer: issuer,
      audience: [TokenTypeEnum.Referesh, user.role],
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      jwtid
    },
  });
  return { access_token, refresh_token };
};
