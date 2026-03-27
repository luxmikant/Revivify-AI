import { Router } from "express";
import multer from "multer";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { extractUserId } from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("FILE_TYPE_UNSUPPORTED"));
      return;
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/upload", extractUserId, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "NO_FILE", message: "No file provided" });
      return;
    }

    let text: string;

    if (file.mimetype === "application/pdf") {
      const data = await pdf(file.buffer);
      text = data.text;
    } else {
      // DOCX
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value;
    }

    res.json({ text });
  } catch (err: any) {
    if (err.message === "FILE_TYPE_UNSUPPORTED") {
      res.status(400).json({ error: "FILE_TYPE_UNSUPPORTED", message: "Only PDF and DOCX files are supported" });
      return;
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "FILE_TOO_LARGE", message: "File must be under 5 MB" });
      return;
    }
    console.error("Upload error:", err);
    res.status(500).json({ error: "UPLOAD_FAILED", message: "Failed to process file" });
  }
});
