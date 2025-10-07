import express from "express";
const app = express();

app.get("*", (req, res) => {
  const redirectlink = 'https://prompt-about.farabi.me/';
  try {
    res.redirect(redirectlink);
  } catch {
    res.send(`You can visit the page here: <a href="${redirectlink}">${redirectlink}</a>`);
  }
});

export default app;
