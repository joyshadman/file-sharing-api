import { Request, Response, NextFunction } from "express";
import { activeUploads } from "../server";

/**
 * Queue Middleware for Advertic Agency
 * Limits concurrent uploads to 4 to protect server bandwidth and Appwrite limits.
 */
export const checkQueue = (req: Request, res: Response, next: NextFunction) => {
    // We check the size of the Set imported from server.ts
    if (activeUploads.size >= 4) {
        return res.status(429).json({ 
            error: "Queue full", 
            message: "4 users are currently uploading. Please wait a few moments for a slot to open." 
        });
    }
    next();
};