const { Order } = require("../models/order");
const { orderItem } = require("../models/order-item");
const express = require("express");
const router = express.Router();




router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort("dateOrdered");

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.post(`/:id`, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      });

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
    req.body.orderItems.map(async (product) => {
      let newOrderItem = new orderItem({
        quantity: product.quantity,
        product: product.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const newOrderItems = await orderItemsId;

  const totalPricePromises = await newOrderItems.map(async (productId) => {
    const OrderItem = await orderItem
      .findById(productId)
      .populate("product", "price");
    const totalPrice = OrderItem.product.price * OrderItem.quantity;
    return totalPrice;
  });

  let totalPrice = await Promise.all(totalPricePromises);

  let totalPrices = totalPrice.reduce((a, b) => a + b, 0);

  let newOrder = new Order({
    orderItems: newOrderItems,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zipCode: req.body.zipCode,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrices,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  });

  newOrder = await newOrder.save();

  if (!newOrder) {
    res.status(500).json({ message: "Failed to create order" });
  }
  res
    .status(201)
    .json({ message: "Order created successfully", order: newOrder });
});

router.put("/:id", async (req, res) => {
  try {
    const updateStatus = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );

    if (!updateStatus) {
      res.status(404).json({ message: "Order not found" });
    }
    return res
      .status(200)
      .json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (order) {
      await Promise.all(
        order.orderItems.map(async (item) => {
          await orderItem.findByIdAndDelete(item);
        })
      );
      res.status(200).json({ message: "Order deleted successfully" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);
    if (!totalSales) {
      res.status(400).json({ message: "The Order sales cannot be generated" });
    }
    res.send({ totalSales: totalSales.pop().totalsales });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/get/userOrder/:userId", async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userId }).populate({
    path: "orderItems",
    populate: { path: "product", populate: "category" },
  })

  if (!userOrderList) {
    res.status(404).send({
      message: "No orders found for the specified user."
    });
  }
  res.send(userOrderList)
})

module.exports = router;
