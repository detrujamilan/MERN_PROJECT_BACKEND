const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find();

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
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
    res.status(500).json({ message: "false" });
  }
  res.send(newOrder);
});

module.exports = router;
