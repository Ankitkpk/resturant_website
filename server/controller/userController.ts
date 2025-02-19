import { Request, Response } from "express";
import User from "../models/userModel";
import {generateResetToken} from '../utils/token'
import bcrypt from 'bcryptjs';

export const SignUp = async (req: Request, res: Response): Promise<any> => {
    try {
        // Destructure request body to get the required fields
        const { name, email, password, contact } = req.body;

        // Validate that required fields are provided
        if (!name || !email || !password || !contact) {
            return res.status(400).json({ success: false, message: "Name, email, password, and contact are required" });
        }

        // Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already in use" });
        }

        // Hash the password using bcrypt
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
        const verificationToken="ankits"; //generateverificationToken();
        // Create a new user object
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            contact:Number(contact),
            verificationToken,
            verificationTokenExpiresAt:Date.now()+60*60*1000,


        });
      //generateToken(req,user)//
      // await sendvericationemail(email,verificationToken);//
       
        await newUser.save();

        return res.status(200).json({
            success: true,
            newUser,
            message: "Sign-up successful",
            
        });
    } catch (error: any) {
       
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const Login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    try {
      
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT Token
        
        user.lastLogin = new Date();
        await user.save();

        return res.status(200).json({ success: true, message: "Login successful" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


export const VerifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const { verificationCode } = req.body;
    try {
        const user = await User.findOne({
            verificationToken:verificationCode,
            //code is available only for oneday//
            verificationTokenExpiresAt: { $gt:new Date() }
             }).select("-password"); ;

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification code." });
        }

        user.isVerified = true;
        user.verificationToken = undefined; 
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        //send welcome email//
        
        return res.status(200).json({success:true , user, message: "Email successfully verified." });
   } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const Logout = async (req: Request, res: Response): Promise<Response> => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        return res.status(200).json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const forgetPassword = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
  
    try {
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
  
      const user = await User.findOne({ email }); // Correct database query
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
       user.resetPasswordToken = generateResetToken();
       user.resetPasswordTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); //1hour
       user.save();
       await sendPasswordResetEmail(user.email ,`${process.env.CLIENT_URL}/resetpassword/${token}`)
      return res.status(200).json({ message: "Password reset link sent successfully" });
    } catch (error) {
      console.error("Error in forgetPassword:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };