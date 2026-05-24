import { redisClient } from "../../DB/redis.connection.db.js";
import { SubjectEnum } from "../enums/email.enum.js";

export const revokeTokenKey=({userId ,jti})=>{
      return `user:RevokeToken:${userId}:${jti}`;

}

export const revokeTokenKeyPrefix = ({userId}={}) => {
    return `user:RevokeToken:${userId}`;
}

export const otpKey = ({email,subject=SubjectEnum.ConfirmEmail}={}) => {
    return `OTP::User::${email}::${subject}`;
}


export const maxAttempOtpKey= ({email,subject="ConfirmEmail"}={}) => {
    return `${otpKey({email,subject})}::MaxTrial `;
}

export const blockOtpKey= ({email,subject="ConfirmEmail"}={}) => {
    return `${otpKey({email,subject})}::block `;
}


export const set = async ({ key, value, ttl } = {}) => {
  try {
    let data = typeof value === "string" ? value : JSON.stringify(value);
    return ttl
      ? await redisClient.set(key, data, { EX: ttl })
      : await redisClient.set(key, data);
  } catch (error) {
    console.log(`fail in redis set operation ${error}`);
  }
};

export const update = async ({ key, value, ttl } = {}) => {
  try {
    const exists = await redisClient.exists(key);
    if (!exists) return false;
    let data = typeof value === "string" ? value : JSON.stringify(value);
    return ttl
      ? await redisClient.set(key, data, { EX: ttl })
      : await redisClient.set(key, data);
  } catch (error) {
    console.log(`fail in redis update operation ${error}`);
  }
};

export const get = async ({key}={}) => {
    try {
        const data = await redisClient.get(key);
        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    } catch (error) {
        console.error(`fail in redis mGet operation ${error}`);
        return null;
    }
};

export const mGet = async ({ keys = [] } = {}) => {
  try {
    if (!keys.length) return 0;
    return await redisClient.mGet(keys);
  } catch (error) {
    console.log(`fail in redis mGet operation ${error}`);
  }
};

export const ttl = async ({ key } = {}) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.log(`fail in redis ttl operation ${error}`);
  }
};

export const exists = async ({ key } = {}) => {
  try {
    return await redisClient.exists(key);
  } catch (error) {
    console.log(`fail in redis exists operation ${error}`);
  }
};


export const incr = async ({ key } = {}) => {
  try {
    return await redisClient.incr(key);
  } catch (error) {
    console.log(`fail in redis incr operation ${error}`);
  }
};

export const expire = async ({ key, ttl } = {}) => {
  try {
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log(`fail in redis update operation ${error}`);
  }
};

export const allKeysByPrefix = async (prefix) => {
  try {
    return await redisClient.keys(`${prefix}*`);
  } catch (error) {
    console.log(`fail in redis keys operation ${error}`);
  }
};

export const deleteKey = async ({key}={}) => {
  try {
    if (!key.length) return 0;
    return await redisClient.del(key);
  } catch (error) {
    console.log(`fail in redis delete operation ${error}`);
  }
};
