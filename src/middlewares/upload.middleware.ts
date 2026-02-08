import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * CommonJS Version
 * In CommonJS, __dirname is globally available.
 * We go up two levels from src/middlewares to reach the project root.
 */
const uploadDir = path.join(__dirname, "../../temp-uploads");

// Ensure the temporary directory exists for 5GB chunks
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename to prevent overwriting during concurrent uploads
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 // Strict 5GB limit
    }
});