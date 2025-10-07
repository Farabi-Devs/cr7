const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const redirectlink = 'https://prompt-about.farabi.me/';
    try {
        res.redirect(redirectlink);
    } catch {
        res.send(`You can visit the page here: <a href="${redirectlink}">${redirectlink}</a>`);
    }
});

module.exports = router;
