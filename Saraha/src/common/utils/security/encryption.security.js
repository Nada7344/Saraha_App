import crypto from "node:crypto";
import {
  ENC_SECRET_KEY,
  IV_LENGTH,
} from "../../../../config/config.service.js";

export const generateEncryption = async (plaintext) => {
  const iv = crypto.randomBytes(IV_LENGTH); //buffer
  const cipherIV = crypto.createCipheriv("aes-256-cbc", ENC_SECRET_KEY, iv); // used to encrypt data
  let cipherText = cipherIV.update(plaintext, "utf-8", "hex");
  cipherText += cipherIV.final("hex");
  return `${iv.toString("hex")}:${cipherText.toString("hex")}`;
};

export const generateDecryption =async (ciphertext)=>{
    const [iv ,encryptedData] = ciphertext.split(':')||[];
    const ivLikeBinary = Buffer.from(iv ,'hex');
    let decippherIV = crypto.createDecipheriv('aes-256-cbc',ENC_SECRET_KEY,ivLikeBinary);
    let plaintext =decippherIV.update(encryptedData,'hex','utf-8');
    plaintext += decippherIV.final('utf-8');
   
    return plaintext ;
}
