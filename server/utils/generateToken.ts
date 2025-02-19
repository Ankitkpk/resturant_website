import Jwt from "jsonwebtoken";
import { Response } from "express";
import { IUserDocument } from "../models/userModel";

export const generateToken = (res: Response, user:IUserDocument): string => {
    try {
        const token = Jwt.sign(
            { userId: user._id },  
            process.env.JWT_SECRET as string, 
            { expiresIn: "1d" } 
        );

        // Set token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict",
            maxAge: 24*60 * 60 * 1000, 
        });

        return token; 
    } catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Token generation failed");
    }
};
