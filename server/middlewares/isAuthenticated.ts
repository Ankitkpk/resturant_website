import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


declare global {
    namespace Express{
     interface Request
     {
        id:string
     }
    }
}

export const authenticateUser = (req:Request, res: Response, next: NextFunction): Response | void => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]; // Check both cookie & headers
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
        req.id = decoded.userId; 

        next(); // Continue to next middleware
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};
