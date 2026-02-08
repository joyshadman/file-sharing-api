import express from "express";
import upload from "../middlewares/upload";
import { uploadFile } from "../controllers/uploadcontroller";
import { downloadFile } from "../controllers/downloadController";

const router = express.Router();

router.post("/upload",upload.single("file"),uploadFile);
router.get("/download/:id",downloadFile);

export default router;
