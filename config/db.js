const mongoose = require("mongoose");

const connect = () => {
  mongoose.connect(process.env.DATABASE_URL);
  console.log("Connected to MongoDB");
};

module.exports = connect;
