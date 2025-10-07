const express = require('express');
const app = express();

app.get('/', (req, res) => {
    const redirectlink = 'https://prompt-about.farabi.me/';
    try {
        res.redirect(redirectlink);
    } catch {
        res.send(`You can visit the page here: <a href="${redirectlink}">${redirectlink}</a>`);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`fallback server running on port ${port}`);
});
