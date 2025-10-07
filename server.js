import express from "express";
import defaultRoute from "./default.js";
import helpdiscord from "./helpdiscord.js";
import fallback from "./fallback.js";

const app = express();

// specific routes first
app.use("/helpdiscord", helpdiscord);
app.use("/prompt", defaultRoute); // ✅ now isolated under /prompt
app.use(fallback); // fallback for everything else

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
