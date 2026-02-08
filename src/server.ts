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

// 1. Socket.io Configuration (v4.8.3 compatible)
const io = new Server(httpServer, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 2. Global State for Advertic Slot System
export const activeUploads = new Set<string>();
export const userFiles = new Map<string, string>();

// 3. Middlewares
app.use(cors());
app.use(express.json());

// CSP Fix for Chrome DevTools
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy", 
        "default-src 'self'; connect-src 'self' https://cloud.appwrite.io ws://localhost:5000 http://localhost:5000;"
    );
    next();
});

// 4. Routes

// Health Check
app.get("/", (req, res) => {
    res.send("🚀 Advertic API (Appwrite v22) is operational.");
});

// Upload Route Logic
app.post("/api/upload", upload.single("file"), async (req: any, res: any) => {
    const { socketId } = req.body;

    // Slot Rule: Max 4 users
    if (activeUploads.size >= 4) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(429).json({ error: "Queue is full. Only 4 concurrent uploads allowed." });
    }

    if (!req.file || !socketId) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Missing file or socketId." });
    }

    try {
        activeUploads.add(socketId);

        // Upload to Appwrite via v22 Service
        const file = await uploadToAppwrite(req.file.path, req.file.originalname);
        
        // Track for 5-minute deletion
        userFiles.set(socketId, file.$id);

        const downloadUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

        res.json({
            success: true,
            url: downloadUrl,
            fileId: file.$id
        });

    } catch (error: any) {
        console.error("v22 Upload Error:", error.message);
        res.status(500).json({ error: error.message || "Appwrite Cloud Upload failed." });
    } finally {
        activeUploads.delete(socketId);
        // Clean disk immediately after cloud transfer
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

// 5. Socket.io Event Handling
io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
        const fileId = userFiles.get(socket.id);
        if (fileId) {
            console.log(`⏱️ Deletion timer started (5 mins) for file: ${fileId}`);
            setTimeout(async () => {
                try {
                    await deleteFromAppwrite(fileId);
                    userFiles.delete(socket.id);
                    console.log(`🗑️ Auto-deleted expired file: ${fileId}`);
                } catch (err) {
                    console.error("Auto-delete cleanup failed:", err);
                }
            }, 5 * 60 * 1000);
        }
    });
});

// 6. Start Server with v22 Optimizations
const PORT = process.env.PORT || 5000;
httpServer.timeout = 0; // Prevent 5GB upload timeout disconnects

httpServer.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Advertic API v22: http://localhost:${PORT}`);
    console.log(`📡 Appwrite: ${process.env.APPWRITE_ENDPOINT}`);
    console.log(`-----------------------------------------`);
});