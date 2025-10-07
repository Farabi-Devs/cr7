const express = require('express');
const helpdiscord = require('./helpdiscord');
const fallback = require('./fallback');

const app = express();

app.use(helpdiscord);
app.use(fallback);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
