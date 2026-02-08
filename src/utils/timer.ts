import { deleteFromAppwrite } from "../services/storage.service";

/**
 * Schedules a file for deletion after the user disconnects.
 * @param fileId The Appwrite file ID to delete
 * @param delayMinutes Minutes to wait before deletion (default 5)
 */
export const scheduleFileDeletion = (fileId: string, delayMinutes: number = 5) => {
    const delayMs = delayMinutes * 60 * 1000;

    console.log(`[Timer] File ${fileId} scheduled for deletion in ${delayMinutes} mins.`);

    return setTimeout(async () => {
        try {
            await deleteFromAppwrite(fileId);
            console.log(`[Timer] Successfully auto-deleted file: ${fileId}`);
        } catch (error) {
            console.error(`[Timer] Auto-delete failed for ${fileId}:`, error);
        }
    }, delayMs);
};