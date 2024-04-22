const express = require("express");
const cors = require("cors");
const app = express();

require('dotenv/config')
const api = process.env.APP_URL;

app.use(express.json())
app.use(cors())

app.get(`${api}/products`, (req, res) => {
    const products = {
        name: "Hair Machine",
        image: "Some_Url"
    }
    res.send(products);
})
app.post(`${api}/products`, (req, res) => {
    const newProducts = req.body;
    res.send(newProducts);
})

const port = 3001;

app.listen(port, () => {
    console.log(`Server Is Running https://localhost:${port}`);
})