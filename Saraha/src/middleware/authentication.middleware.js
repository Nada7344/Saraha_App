 import { TokenTypeEnum } from "../common/enums/security.enum.js";
import { ForbiddenException, UnauthorizedException } from "../common/utils/index.js";
import { decodeToken } from "../common/utils/security/token.security.js";

 
 export const authentecation =  (tokenType =TokenTypeEnum .Access )=>{
return async (req ,res ,next)=>{
   const [schema , credentials]=req.headers.authorization?.split(" ") || [];  
   if(!schema || !credentials){
         throw UnauthorizedException({message:"missing authentication key or invalid approach "})
   } 
    req.user = await decodeToken({token:credentials ,tokenType});
   next();
   }
 }


  export const authorization=  (accessRole=[] )=>{
return async (req ,res ,next)=>{
      if(!accessRole.includes(req.user.role)){
         throw ForbiddenException({message:"Not authorized account" })
      }
   next();
   }
 }