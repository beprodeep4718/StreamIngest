import express from "express";
import busboy from "busboy";
import { v4 as uuidv4 } from "uuid";
import { UploadSession } from "../models/UploadSession.js";
import { processCSVStream } from "../services/csvProcessor.js";
import { uploadLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/", uploadLimiter, (req, res) => {
  const bb = busboy({ headers: req.headers });

  const jobId = uuidv4();
  let sessionId: string | null = null;

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
      console.error(err);
    }
  });

  bb.on("finish", () => {
    res.json({
      message: "Streaming started",
      jobId,
      sessionId,
    });
  });

  req.pipe(bb);
});

export default router;