import { Request, Response, NextFunction } from "express";
import { activeUploads } from "../server"; // We import the Set from server.ts

export const checkQueue = (req: Request, res: Response, next: NextFunction) => {
    // Rule: Max 4 concurrent uploads
    if (activeUploads.size >= 4) {
        return res.status(429).json({ 
            error: "Queue full", 
            message: "4 users are currently uploading. Please wait a few moments." 
        });
    }
    next();
};