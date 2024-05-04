const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {

  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ message: "Failed to fetch category list." });
  }

  res.send(categoryList);

});


router.get(`/:id`, async (req, res) => {
  const categoryListById = await Category.findById(req.params.id);

  if (!categoryListById) {
    res.status(500).json({ message: "Failed to fetch category list." });
  }
  res.send(categoryListById);
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category)
    return res.status(404).send("the category cannot be  created!");

  res.send(category);
});

router.put("/:id", async (req, res) => {
  try {
    const categoryUpdate = await Category.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      icon: req.body.icon || categoryUpdate.icon,
      color: req.body.color,
    }, { new: true }
    )

    if (!categoryUpdate) {
      return res.status(400).send('the category cannot be created!')
    }

    return res.send(categoryUpdate)
  } catch (error) {
    res.status().json({ message: error })
  }


})



router.delete("/:id", (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ message: "Category successfully removed" });
      } else {
        return res
          .status(404)
          .send({ message: "the category cannot be removed!" });
      }
    })
    .catch((err) => {
      return res.status(400).send({ error: err });
    });
});

module.exports = router;
