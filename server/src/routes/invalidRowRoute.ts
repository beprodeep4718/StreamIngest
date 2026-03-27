import express from "express";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import { InvalidRow } from "../models/InvalidRow.js";


const router = express.Router();

router.get(
  "/invalid-rows",
  authMiddleware,
  requireRole(["admin", "viewer"]),
  async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const query: any = {};

    if (req.query.sessionId) {
      query.sessionId = req.query.sessionId;
    }

    if (req.query.errorType) {
      query.errorType = req.query.errorType;
    }

    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    const rows = await InvalidRow.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InvalidRow.countDocuments(query);

    res.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);