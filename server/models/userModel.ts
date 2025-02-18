import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  profilePicture: string;
  admin: boolean;
  lastLogin?:Date;
  isVerified:boolean;
  resetPasswordToken:string,
  resetPasswordTokenExpiresAt:Date,
  verificationToken:string,
  verificationTokenExpiresAt:Date,
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/ },
    password: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    profilePicture: { type: String, required: false }, 
    admin: { type: Boolean, default: false },
    lastLogin:{type:Date , default:Date.now},
    isVerified:{type:Boolean , default:false},
    resetPasswordToken:{type:String},
    resetPasswordTokenExpiresAt:{type:Date},
    verificationToken:{type:String},
    verificationTokenExpiresAt:{type:Date}
  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
