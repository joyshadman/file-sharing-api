import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import { checkQueue } from "../middlewares/queue.middleware";
import { handleFileUpload } from "../controllers/upload.controller";

const router = Router();

// Order: 1. Check if 4 slots full -> 2. Stream 5GB to Disk -> 3. Send to Appwrite
router.post("/upload", checkQueue, upload.single("file"), handleFileUpload);

export default router;