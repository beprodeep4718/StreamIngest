import mongoose from "mongoose";

const uploadSessionSchema = new mongoose.Schema(
  {
    fileName: String,
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    processingTime: { type: Number, default: 0 },
    uploadedBy: String,
  },
  { timestamps: true },
);

export const UploadSession = mongoose.model(
  "UploadSession",
  uploadSessionSchema,
);
