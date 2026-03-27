import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "viewer"],
    default: "viewer",
  },
});

export const Admin = mongoose.model("Admin", adminSchema);