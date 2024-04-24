
const express = require("express");
const { Product } = require("../models/product");
const app = express();
const api = process.env.APP_URL
app.use(cors());

app.get(`${api}/products`, async (req, res) => {
    let productsList = await Product.find();
    if (!productsList) {
      res.status(501).json({ success: false });
    }
    res.send(productsList);
  })

