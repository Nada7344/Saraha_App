import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums/user.enum.js";

const messageSchema = new mongoose.Schema(
  {
    content:{type:String ,minLength:2,maxLength:10000, required:function(){
        return !this.attachments?.length
    }},
    attachments:{type:[String] },
    receiverId:{type:mongoose.Schema.Types.ObjectId ,ref:"User",required:true},
 senderId:{type:mongoose.Schema.Types.ObjectId ,ref:"User"}

  },
  {
    collection:"Message",
    timestamps:true,
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    autoIndex:true,
  
  }
);



export const MessageModel = mongoose.model.Message || mongoose.model("Message",messageSchema)