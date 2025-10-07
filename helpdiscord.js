import express from "express";
const app = express();

app.get("/help", (req, res) => {
  if (req.query.discord !== undefined) {
    const discordlink = 'https://discord.gg/69';
    try {
      res.redirect(discordlink);
    } catch {
      res.send(`You can visit Discord here: <a href="${discordlink}">${discordlink}</a>`);
    }
  } else {
    res.send('no valid query provided');
  }
});

export default app;
