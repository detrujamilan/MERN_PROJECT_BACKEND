const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { default: mongoose, Mongoose } = require("mongoose");

const IMG_FILE_TYPE = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = IMG_FILE_TYPE[file.mimetype];
    let uploadError = new Error("Image upload error");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = IMG_FILE_TYPE[file.mimetype];
    // cb(null, `${fileName}-${Date.now()}.${extension}`);
    cb(null, `${fileName}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  const productList = await Product.find();

  if (!productList) {
    res.status(500).json({ message: "Failed to fetch product list." });
  }
  res
    .status(200)
    .json({ message: "Product list fetched successfully.", productList });
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(500).json({ message: "Failed to fetch product Id." });
    }

    const productId = await Product.findById(req.params.id);

    if (!productId)
      return res
        .status(404)
        .json({ message: `Product Id Not Found ${productId}` });

    const file = req.file;
    let imagePath;

    if (file) {
      const fileName = file.originalname.split(" ").join("-");
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagePath = `${basePath}${fileName}`;
    } else {
      imagePath = productId.image;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      price: req.body.price,
      countInStock: req.body.countInStock,
      category: req.body.category,
      description: req.body.description,
      image: imagePath,
    });

    if (!product) {
      res.status(404).json({ message: "Product not found." });
    }

    return res.send(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

router.get("/:id", async (req, res) => {
  const productList = await Product.findById(req.params.id);

  if (!productList) {
    res.status(500).json({ message: "Failed to fetch product list." });
  }

  res.send(productList);
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

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const categoryId = await Category.findById(req.body.category);
  if (!categoryId)
    res.status(500).json({ message: "Failed to fetch category list." });

  const file = req.file;
  if (!file) return res.status(500).json({ message: "Image File not found." });

  const fileName = req.file.originalname.split(" ").join("-");

  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    countInStock: req.body.countInStock,
    category: req.body.category,
    description: req.body.description,
    image: `${basePath}${fileName}`,
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

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ message: `Invalid Product Id ` });
    }

    const files = req.files;

    let imagesPaths = [];
    let basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if (files) {
      files.map((file) => {
        return imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      }
    );

    if (!product)
      return res.status(404).json({ message: "the Product cannot be updated" });

    return res.send(product);
  }
);

module.exports = router;
