const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log("not connected", err);
    });
};

module.exports = connect;
