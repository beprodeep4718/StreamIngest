import "./config/env.js"
import express from "express";
import cors from "cors";
import uploadRoute from "./routes/uploadRoute.js";
import progressRoute from "./routes/progressRoute.js";
import analyticsRoute from "./routes/analyticsRoute.js";
import sessionsRoute from "./routes/sessionsRoute.js";
import invalidRowRoute from "./routes/invalidRowRoute.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/progress", progressRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1", sessionsRoute);
app.use("/api/v1", invalidRowRoute);

connectDB()
  .then(() => {
    console.log("Connected to DB, starting server...");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });
