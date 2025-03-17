import express, { Request, Response, Router, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route POST pour uploader une image
router.post(
  "/",
  upload.single("image"),
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      res.status(400).json({ message: "no file uploaded." });
      return;
    }

    const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl });
  }
);

export default router;
