const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connect = require("./config/db");
const morgan = require("morgan");
const app = express();

require("dotenv/config");
const api = process.env.APP_URL;

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

const productSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("Products", productSchema);

app.get(`${api}/products`, async (req, res) => {
  let productsList = await Product.find();
  if (!productsList) {
    res.status(501).json({ success: false });
  }

  res.send(getAllProducts);
});

app.post(`${api}/products`, (req, res) => {
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });

  product
    .save()
    .then((createProduct) => {
      res.status(201).json(createProduct);
    })
    .catch((error) => {
      res.status(501).json({
        error: error.message,
        success: false,
      });
    });
});

const port = 3001;

app.listen(port, () => {
  connect();
  console.log(`Server Is Running https://localhost:${port}`);
});
