import { Request, Response } from "express";
import { uploadToAppwrite } from "../services/storage.service";
import { activeUploads, userFiles } from "../server";
import fs from "fs";

export const handleFileUpload = async (req: Request, res: Response) => {
    const { socketId } = req.body;

    if (!req.file || !socketId) {
        return res.status(400).json({ error: "File and SocketID are required." });
    }

    try {
        // 1. Add to active queue
        activeUploads.add(socketId);

        // 2. Perform the upload to Appwrite
        const file = await uploadToAppwrite(req.file.path, req.file.originalname);

        // 3. Map the socket to the file ID for the 5-minute rule
        userFiles.set(socketId, file.$id);

        // 4. Generate the URL
        const downloadUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

        res.status(200).json({
            success: true,
            url: downloadUrl,
            fileId: file.$id,
            expiresIn: "5 minutes after you leave"
        });

    } catch (error) {
        console.error("Upload Controller Error:", error);
        res.status(500).json({ error: "Failed to upload to Appwrite storage." });
    } finally {
        // Cleanup: Remove from queue and delete local temp file
        activeUploads.delete(socketId);
        if (req.file) fs.unlinkSync(req.file.path);
    }
};