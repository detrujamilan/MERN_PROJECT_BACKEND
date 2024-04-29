const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const productList = await Product.find();

  if (!productList) {
    res.status(500).json({ message: "Failed to fetch product list." });
  }
  res
    .status(200)
    .json({ message: "Product list fetched successfully.", productList });
});

router.post(`/`, (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    countInStock: req.body.countInStock,
  });

  product
    .save()
    .then((createdProduct) => {
      res.status(201).json({
        message: "Product created successfully.",
        product: createdProduct,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Failed to create product.",
        error: err,
      });
    });
});

router.delete(`/:id`, (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (!product) {
        res.status(404).json({ message: "Product not found." });
      } else {
        res.status(200).json({ message: "Product deleted successfully." });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

router.get(`/get/count`, async (req, res) => {
  try {
    let totalProducts = await Product.countDocuments();
    if (!totalProducts) {
      res.status(404).json({ message: "No products found." });
    }
    return res.status(200).json({
      totalProducts: totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
