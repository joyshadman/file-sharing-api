import { Router } from "express";
import upload from "../middlewares/upload";
import cloudinary from "../config/cloudinary";

const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "file-sharing"
    });

    res.json({
      message: "Upload success",
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
