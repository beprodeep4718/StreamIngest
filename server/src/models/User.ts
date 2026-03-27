import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,   // 🔥 critical
    index: true,    // 🔥 performance
  },
  age: {
    type: Number,
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UploadSession",
  },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);