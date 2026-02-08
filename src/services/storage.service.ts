import { Client, Storage, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file"; // Direct import fix
import { appwriteStorage } from "../config/appwrite";

/**
 * Uploads a file from the local disk to Appwrite Storage
 */
export const uploadToAppwrite = async (filePath: string, fileName: string) => {
    // InputFile.fromPath streams the file to avoid memory issues with 5GB files
    return await appwriteStorage.createFile(
        process.env.APPWRITE_BUCKET_ID!,
        ID.unique(),
        InputFile.fromPath(filePath, fileName)
    );
};

/**
 * Deletes a file from Appwrite Storage
 */
export const deleteFromAppwrite = async (fileId: string) => {
    return await appwriteStorage.deleteFile(
        process.env.APPWRITE_BUCKET_ID!,
        fileId
    );
};