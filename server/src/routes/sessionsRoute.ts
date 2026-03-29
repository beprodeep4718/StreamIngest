import express from "express";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import { UploadSession } from "../models/UploadSession.js";

const router = express.Router();

router.get(
  "/sessions",
  authMiddleware,
  requireRole(["admin", "viewer"]),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const skip = (page - 1) * limit;

      const sessions = await UploadSession.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await UploadSession.countDocuments();

      res.json({
        data: sessions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  }
);

export default router;