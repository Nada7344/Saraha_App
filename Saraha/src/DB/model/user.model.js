import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
      minLength: [2, `firstName cannot be less than 2 char`],
      maxLength: 25,
      trim: true,
    },
    lastName: {
      type: String,
      require: true,
      minLength: [2, `lastName cannot be less than 2 char`],
      maxLength: 25,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function(){
        return this.provider == ProviderEnum.System
      }
    },
    phone: String,

    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.System
    },
    role:{
    type: Number,
      enum: Object.values(RoleEnum),

      default: RoleEnum.User
    },
    profilePicture: String,
    coverProfilePicture: [String],
    confirmEmail: Date,
    changeCredentialTime: Date,

  },
  {
    collection:"User",
    timestamps:true,
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    autoIndex:true,
    toJSON :{virtuals :true},
    toObject:{virtuals :true}

  }
);

userSchema.virtual("username").set(function(value){
    const [firstName ,lastName] = value?.split(' ')||[];
    this.set({firstName ,lastName})
}).get(function(){
    return this.firstName +" "+ this.lastName ;
})

export const UserModel = mongoose.model.User || mongoose.model("User", userSchema)