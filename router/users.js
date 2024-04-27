const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(404).json({ message: "No users found." });
  }
  res.status(200).json({
    success: true,
    message: "User list fetched successfully.",
    userList,
  });
});

router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
  });

  user = await user.save(user);

  if (!user) {
    res.status(500).json({ message: "Failed to create user." });
  }
  res.status(201).json({ message: "User created successfully.", user });
});

router.get(`/:id`, async (req, res) => {
  let user = await User.findById(req.params.id).select("-passwordHash");

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

  if (user && bcrypt.compareSync(req.body.passwordHash, user.passwordHash)) {
    let secret = process.env.secret;
    let token = jsonWebToken.sign(
      {
        userId: user.id,
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

module.exports = router;
