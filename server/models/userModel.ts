import mongoose, { Document, Schema } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  contact: string;
  address?: string;
  city?: string;
  country?: string;
  profilePicture?: string;
  admin: boolean;
  lastLogin?: Date;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordTokenExpiresAt?: Date | null;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date | null;
}

// Extend IUser with Document to include Mongoose's built-in properties like `_id`
export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUserDocument> = new Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ 
    },
    password: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    profilePicture: { type: String },
    admin: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiresAt: { type: Date, default: null },
    verificationToken: { type: String },
    verificationTokenExpiresAt: { type: Date, default: null }
  },
  {
    timestamps: true, 
  }
);

// Use IUserDocument in the model definition
const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;
