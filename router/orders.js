const { Order } = require("../models/order");
const { orderItem } = require("../models/order-item");
const express = require("express");
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
      .populate({ path: "orderItems", populate: { path: "product", populate: "" } });

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
      let newOrderItem = new orderItem({
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


router.put("/:id", async (req, res) => {
  try {
    const updateStatus = await Order.findByIdAndUpdate(req.params.id,
      {
        status: req.body.status
      }, {
      new: true
    }
    )

    if (!updateStatus) {
      res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ message: "Order status updated successfully", });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
})



router.delete('/:id', async (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async item => {
          await orderItem.findByIdAndRemove(item)
        })
        res.status(200).json({ message: "Order deleted successfully" });
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    }).catch((err) => {
      res.status(500).json({ message: err.message });
    })
})

module.exports = router;

