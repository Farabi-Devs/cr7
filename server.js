import express from "express";
import cors from "cors"; // ✅ add this
import defaultRoute from "./default.js";
import helpdiscord from "./helpdiscord.js";
import freeopenai from "./freeopenai.js";
import fallback from "./fallback.js";

const app = express();

// ✅ Enable CORS for all routes
app.use(cors());

// specific routes first
app.use("/helpdiscord", helpdiscord);
app.use("/prompt", defaultRoute);
app.use("/", freeopenai); // handles "/[PROMPT]" directly
app.use(fallback); // fallback for everything else

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
