import { ID, InputFile } from "node-appwrite";
import { appwriteStorage } from "../config/appwrite";

/**
 * Version 9.x Compatible Service
 * This version uses the standard createFile structure that older 
 * Appwrite servers (returning error 1.8.1) expect.
 */
export const uploadToAppwrite = async (filePath: string, fileName: string) => {
    const bucketId = (process.env.APPWRITE_BUCKET_ID || "").trim();

    if (!bucketId) {
        throw new Error("Missing APPWRITE_BUCKET_ID");
    }

    // In v9, InputFile.fromPath is part of the main export
    return await appwriteStorage.createFile(
        bucketId,
        ID.unique(),
        InputFile.fromPath(filePath, fileName)
    );
};

export const deleteFromAppwrite = async (fileId: string) => {
    const bucketId = (process.env.APPWRITE_BUCKET_ID || "").trim();
    if (!bucketId || !fileId) return;

    return await appwriteStorage.deleteFile(bucketId, fileId);
};