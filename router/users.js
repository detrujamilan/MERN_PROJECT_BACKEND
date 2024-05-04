const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-password");

  if (!userList) {
    res.status(404).json({ message: "No users found." });
  }
  res.status(200).json({
    message: "User list fetched successfully.",
    userList,
  });
});

router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hash(req.body.password, 10),
  });

  user = await user.save(user);

  if (!user) {
    res.status(500).json({ message: "Failed to create user." });
  }
  res.status(201).json({ message: "User created successfully.", user });
});

router.get(`/:id`, async (req, res) => {
  let user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404).json({ message: "User not found." });
  }

  res.status(200).json({ message: "User fetched successfully.", user: user });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404).json({
      message:
        "User not found. Please check your email or register a new account.",
    });
  }

  let bcryptPassword = await bcrypt.compare(req.body.password, user.password)

  if (user && bcryptPassword) {
    let secret = process.env.secret;
    let token = jsonWebToken.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );
    res.send({
      user: user.email,
      token: token,
    });
  } else {
    res.status(401).json({
      message: "Invalid email or password. Please try again.",
    });
  }
});

router.post("/register", async (req, res) => {
  let createUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  });

  createUser = await createUser.save();

  if (!createUser) {
    res.status(401).json({ message: "User registration failed." });
  }

  res
    .status(201)
    .json({ message: "User registered successfully.", user: createUser });
});

router.delete("/:id", async (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User not found." });
      } else {
        res.status(200).json({ message: "User deleted successfully." });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get(`/get/count`, async (req, res) => {
  try {
    let totalUsers = await User.countDocuments();
    if (!totalUsers) {
      res.status(404).json({ message: "No User found." });
    }
    return res.status(200).json({
      totalUsers: totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
