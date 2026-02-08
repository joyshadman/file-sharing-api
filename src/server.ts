import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

// Service and Middleware Imports
import { uploadToAppwrite, deleteFromAppwrite } from "./services/storage.service";
import { upload } from "./middlewares/upload.middleware";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// 1. Socket.io Configuration
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

// 2. Global State (Exported for Middlewares)
export const activeUploads = new Set<string>();
export const userFiles = new Map<string, string>();

// 3. Middlewares
app.use(cors());
app.use(express.json());

// 4. The Upload Route Logic
app.post("/api/upload", upload.single("file"), async (req: any, res: any) => {
    const { socketId } = req.body;

    // Rule: Queue check
    if (activeUploads.size >= 4) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(429).json({ error: "Server busy. Try again in a minute." });
    }

    if (!req.file || !socketId) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Missing file or socketId." });
    }

    try {
        activeUploads.add(socketId);

        // Upload to Appwrite Cloud
        const file = await uploadToAppwrite(req.file.path, req.file.originalname);
        
        // Register for 5-minute cleanup
        userFiles.set(socketId, file.$id);

        const downloadUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

        res.json({
            url: downloadUrl,
            fileId: file.$id,
            message: "Success! Link expires 5 mins after you leave."
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Cloud upload failed." });
    } finally {
        activeUploads.delete(socketId);
        // Clean up server local disk
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

// 5. Real-time Logic (Socket.io)
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Frontend slot check
    socket.on("check_queue", () => {
        socket.emit("queue_status", { allowed: activeUploads.size < 4 });
    });

    // 5-Minute Auto-Delete Rule
    socket.on("disconnect", () => {
        const fileId = userFiles.get(socket.id);
        if (fileId) {
            console.log(`Scheduling deletion for ${fileId} in 5 minutes...`);
            setTimeout(async () => {
                try {
                    await deleteFromAppwrite(fileId);
                    userFiles.delete(socket.id);
                    console.log(`Auto-deleted: ${fileId}`);
                } catch (err) {
                    console.error("Auto-delete failed:", err);
                }
            }, 5 * 60 * 1000);
        }
    });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
httpServer.timeout = 0; // Required for 5GB uploads

httpServer.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Advertic API: http://localhost:${PORT}`);
    console.log(`🔗 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
    console.log(`-----------------------------------------`);
});