import { Request, Response } from "express";
import { uploadToAppwrite } from "../services/storage.service";
import { activeUploads, userFiles } from "../server";
import fs from "fs";

/**
 * Handles the logic for receiving a file from Multer and 
 * streaming it to Appwrite Cloud (v22).
 */
export const handleFileUpload = async (req: Request, res: Response) => {
    const { socketId } = req.body;

    // TypeScript check: ensure req.file exists from Multer
    const fileData = req.file;

    if (!fileData || !socketId) {
        // Cleanup local file if it exists but socketId is missing
        if (fileData) fs.unlinkSync(fileData.path);
        return res.status(400).json({ error: "File and SocketID are required." });
    }

    try {
        // 1. Add to active queue (Slot system)
        activeUploads.add(socketId);

        // 2. Perform the upload to Appwrite
        // This uses the service we fixed with InputFile.fromPath for v22
        const file = await uploadToAppwrite(fileData.path, fileData.originalname);

        // 3. Map the socket to the file ID for the 5-minute auto-delete rule
        userFiles.set(socketId, file.$id);

        // 4. Generate the URL (Using .trim() to ensure no 404s from env spaces)
        const endpoint = process.env.APPWRITE_ENDPOINT?.trim();
        const bucketId = process.env.APPWRITE_BUCKET_ID?.trim();
        const projectId = process.env.APPWRITE_PROJECT_ID?.trim();

        const downloadUrl = `${endpoint}/storage/buckets/${bucketId}/files/${file.$id}/view?project=${projectId}`;

        res.status(200).json({
            success: true,
            url: downloadUrl,
            fileId: file.$id,
            expiresIn: "5 minutes after you leave"
        });

    } catch (error: any) {
        console.error("Upload Controller Error:", error.message);
        res.status(500).json({ 
            error: "Failed to upload to Appwrite storage.",
            details: error.message 
        });
    } finally {
        // Cleanup: Remove from queue
        activeUploads.delete(socketId);

        // Cleanup: Delete local temp file to save disk space on the server
        if (fileData && fs.existsSync(fileData.path)) {
            try {
                fs.unlinkSync(fileData.path);
            } catch (unlinkError) {
                console.error("Local file cleanup failed:", unlinkError);
            }
        }
    }
};