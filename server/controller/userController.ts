import { Request, Response } from "express";
import User from "../models/userModel";
import {generateResetToken} from '../utils/token'
import cloudinary from '../utils/cloudinary'
import {generateVerificationCode} from '../utils/generateVerification'
import {generateToken} from '../utils/generateToken'
import crypto from "crypto"
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
        const verificationToken=generateVerificationCode();
        // Create a new user object
        const user = new User({
            name,
            email,
            password: hashedPassword,
            contact:Number(contact),
            verificationToken,
            verificationTokenExpiresAt:Date.now()+60*60*1000,


        });
        generateToken(res,user)//
      // await sendvericationemail(email,verificationToken);//
       
        await user.save();

        return res.status(200).json({
            success: true,
            user,
            message: "Sign-up successful",
            
        });
    } catch (error: any) {
       
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const Login = async (req: Request, res: Response):  Promise<any> => {
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


export const VerifyEmail = async (req: Request, res: Response):  Promise<any> => {
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

export const Logout = async (req: Request, res: Response):  Promise<any> => {
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


export const forgetPassword = async (req: Request, res: Response):  Promise<any> => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token and expiry time
        const resetToken = generateResetToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        await user.save();
        const resetLink = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;
      //  await sendPasswordResetEmail(user.email, resetLink);

        return res.status(200).json({ message: "Password reset link sent successfully" });
    } catch (error) {
        console.error("Error in forgetPassword:", error);
        return res.status(500).json({ message: "Server error" });
    }
};



export const ResetPassword = async (req: Request, res: Response):  Promise<any> => {
    const { token } = req.params; 
    const { newPassword } = req.body; 

    try {
        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        // Find user by reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: new Date() } // Check if token is still valid
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;

        await user.save();
        //send a email to user to that passwordissuccessfullyset resetemail//
        // await successResetPassword(email);

        return res.status(200).json({ message: "Password reset successful!" });
    } catch (error) {
        console.error("Error in ResetPassword:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const checkAuth = async (req: Request, res: Response):  Promise<any> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User is authenticated", user });
    } catch (error) {
        console.error("Error in checkAuth:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const ProfileUpdate = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID not found" });
        }

        const { name, email, contact, address, city, country,profilePicture} = req.body;

        if (profilePicture) {
            return res.status(400).json({ success: false, message: "Profile picture is required" });
        }

        // Upload image to Cloudinary
        let cloudinaryResponse;
        try {
            cloudinaryResponse = await cloudinary.uploader.upload(profilePicture, {

            });
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ success: false, message: "Failed to upload image" });
        }

        
        const user = await User.findByIdAndUpdate(
            userId,
            { name, email, contact, address, city, country, profilePicture: cloudinaryResponse.secure_url },
            { new: true } // Return updated user
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Error in UploadPhoto:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
