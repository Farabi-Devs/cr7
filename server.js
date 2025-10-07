import express from "express";
import helpdiscord from "./helpdiscord.js";
import defaultRoute from "./default.js";
import fallback from "./fallback.js";

const app = express();

// handle /help?discord first
app.use(helpdiscord);

// handle /[PROMPT] ai routes
app.use(defaultRoute);

// handle empty root /
app.use(fallback);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
