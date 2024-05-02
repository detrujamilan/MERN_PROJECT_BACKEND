const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const { populate } = require("dotenv");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find().populate("user", "name").sort("dateOrdered");

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});


router.post(`/:id`, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({ path: "orderItems", populate: { path: "product" ,populate:""} });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order found", order: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post(`/`, async (req, res) => {
  const orderItemsId = Promise.all(
    req.body.orderItems.map(async (Items) => {
      let newOrderItem = new OrderItem({
        quantity: Items.quantity,
        product: Items.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const newOrderItems = await orderItemsId;

  let newOrder = new Order({
    orderItems: newOrderItems,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zipCode: req.body.zipCode,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: req.body.totalPrice,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  });

  newOrder = await newOrder.save();

  if (!newOrder) {
    res.status(500).json({ message: "Failed to create order" });
  }
  res.status(201).json({ message: "Order created successfully", order: newOrder });
});


router.delete('/:id', async (req, res) => {
  Order.findByIdAndDelete(req.params.id)
    .then((order) => {
      if (!order) {
        res.status(404).json({ message: "Order not found" });
      } else {
        res.status(200).json({ message: "Order deleted successfully" });
      }

    }).catch((err) => {
      res.status(500).json({ message: err.message });
    })
})

module.exports = router;

