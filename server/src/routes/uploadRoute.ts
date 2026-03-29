import express from "express";
import busboy from "busboy";
import { v4 as uuidv4 } from "uuid";
import { UploadSession } from "../models/UploadSession.js";
import { processCSVStream } from "../services/csvProcessor.js";
import { uploadLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/", uploadLimiter, (req, res) => {
  try {
    const bb = busboy({ headers: req.headers });

    const jobId = uuidv4();
    let sessionId: string | null = null;
    let hasError = false;

    bb.on("file", async (name, file, info) => {
      try {
        const session = await UploadSession.create({
          fileName: info.filename,
          status: "processing",
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
        });

        sessionId = session._id.toString();
        processCSVStream(file, jobId, sessionId);
      } catch (err) {
        console.error("Error creating upload session:", err);
        hasError = true;
        res.status(500).json({ error: "Failed to create upload session" });
      }
    });

    bb.on("finish", () => {
      if (!hasError) {
        res.json({
          message: "Streaming started",
          jobId,
          sessionId,
        });
      }
    });

    bb.on("error", (err) => {
      console.error("Busboy error:", err);
      res.status(400).json({ error: "Invalid file upload" });
    });

    req.pipe(bb);
  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;