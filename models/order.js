const { VirtualType } = require("mongoose");
const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "orderItems",
    required: false,
  }],
  shippingAddress1: {
    type: String,
    require: true,
  },
  shippingAddress2: {
    type: String,
    require: true,
  },
  city: {
    type: String,
    require: true,
  },
  zipCode: {
    type: String,
    require: true,
  },
  country: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    require: true,
  },
  status: {
    type: String,
    require: true,
    default: "Padding",
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});



exports.Order = mongoose.model("Order", orderSchema);
