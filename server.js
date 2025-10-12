import express from "express";
import cors from "cors";

import helpdiscord from "./helpdiscord.js";
import freeopenai from "./freeopenai.js";
import defaultRoute from "./default.js";
import fallback from "./fallback.js";

const app = express();

// Enable CORS for all origins (browser-friendly)
app.use(cors());

// Parse JSON if needed
app.use(express.json());

// Routes
app.use("/helpdiscord", helpdiscord);
app.use("/prompt", defaultRoute);
app.use("/", freeopenai); // Handles /{prompt} like text.pollinations.ai
app.use(fallback);         // fallback for everything else

// Export app for Vercel serverless
export default app;
