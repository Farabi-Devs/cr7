import express from "express";
import cors from "cors";

import defaultRoute from "./default.js";
import helpdiscord from "./helpdiscord.js";
import freeopenai from "./freeopenai.js";
import fallback from "./fallback.js";

const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON if needed
app.use(express.json());

// Specific routes first
app.use("/helpdiscord", helpdiscord);
app.use("/prompt", defaultRoute);
app.use("/", freeopenai); // now handles "/[PROMPT]" directly
app.use(fallback); // fallback for everything else

// Export the app for Vercel serverless
export default app;
