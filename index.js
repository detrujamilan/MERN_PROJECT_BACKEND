const express = require("express");
const cors = require("cors");
const app = express();

require('dotenv/config')
const api = process.env.APP_URL;

app.use(express.json())
app.use(cors())

app.get(api + "/products", (req, res) => {
    res.send("Hello Api!");
})

const port = 3000;

app.listen(port, () => {
    console.log(`Server Is Running https://localhost:${port}`);
})