import { Request, Response } from "express";
import { UploadSession } from "../models/UploadSession";
import { User } from "../models/User";

type SessionStatus = "processing" | "completed" | "failed";

type StatusStat = {
  _id: string;
  count: number;
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const [totalUsers, rawStatusStats, trends, ageDistribution, domains] =
      await Promise.all([
        User.countDocuments(),

        UploadSession.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        UploadSession.aggregate([
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              uploads: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        User.aggregate([
          {
            $bucket: {
              groupBy: "$age",
              boundaries: [18, 25, 35, 50, 100],
              default: "Other",
              output: { count: { $sum: 1 } },
            },
          },
        ]),

        User.aggregate([
          {
            $project: {
              domain: {
                $arrayElemAt: [{ $split: ["$email", "@"] }, 1],
              },
            },
          },
          {
            $group: {
              _id: "$domain",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
      ]);

    const statusMap: Record<SessionStatus, number> = {
      processing: 0,
      completed: 0,
      failed: 0,
    };

    const validStatuses: SessionStatus[] = [
      "processing",
      "completed",
      "failed",
    ];
    
    (rawStatusStats as StatusStat[]).forEach((s) => {
      if (validStatuses.includes(s._id as SessionStatus)) {
        statusMap[s._id as SessionStatus] = s.count;
      }
    });

    const response = {
      totalUsers,
      status: statusMap,
      trends,
      ageDistribution,
      domains,
    };

    res.json(response);
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
};