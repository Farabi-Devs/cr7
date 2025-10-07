import express from "express";
import defaultRoute from "./default.js";
import helpdiscord from "./helpdiscord.js";
import fallback from "./fallback.js";

const app = express();

app.use(helpdiscord);
app.use(defaultRoute);
app.use(fallback);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
