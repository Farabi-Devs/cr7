import express from "express";
import defaultRoute from "./default.js";
import helpdiscord from "./helpdiscord.js";
import freeopenai from "./freeopenai.js"; // ✅ new route
import fallback from "./fallback.js";

const app = express();

// specific routes first
app.use("/helpdiscord", helpdiscord);
app.use("/prompt", defaultRoute);
app.use("/freeopenai", freeopenai); // ✅ added new route
app.use(fallback); // fallback for everything else

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
