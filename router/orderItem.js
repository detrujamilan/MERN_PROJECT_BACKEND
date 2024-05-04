
const express = require("express");
const router = express.Router();
const { OrderItem } = require("../models/order-item");


router.get("/", async (req, res) => {
    try {
        const totalOrderItems = await orderItem.find()
        return res.json({ data: totalOrderItems })

    } catch (error) {
        res.status(404).send(error.message)
    }
})

module.exports = router;