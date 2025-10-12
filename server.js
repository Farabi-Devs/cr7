import express from "express";
import cors from "cors";

import helpdiscord from "./helpdiscord.js";
import freeopenai from "./freeopenai.js";
import defaultRoute from "./default.js";
import fallback from "./fallback.js";

const app = express();

// Enable CORS for all origins (so browser apps can use it)
app.use(cors());

// Parse JSON if needed
app.use(express.json());

// Specific routes first
app.use("/helpdiscord", helpdiscord);
app.use("/prompt", defaultRoute);
app.use("/", freeopenai); // Handles /{prompt} like text.pollinations.ai
app.use(fallback); // fallback for everything else

// Export app for Vercel serverless
export default app;
