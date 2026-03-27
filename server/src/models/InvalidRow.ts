import mongoose from "mongoose";

const invalidRowSchema = new mongoose.Schema({
  row: Object,
  error: String,
  lineNumber: Number,
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UploadSession",
  },
}, { timestamps: true });

export const InvalidRow = mongoose.model("InvalidRow", invalidRowSchema);