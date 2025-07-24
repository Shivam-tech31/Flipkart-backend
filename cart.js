const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const cartSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      quantity: Number,
    },
  ],
  status: { type: String, default: "active" },
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);

// Add item to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity = 1, user } = req.body;

    if (!productId || !user) {
      return res
        .status(400)
        .json({ message: "productId and user are required" });
    }

    let cart = await Cart.findOne({ userId: user, status: "active" });

    if (!cart) {
      cart = new Cart({ userId: user, items: [] });
    }

    const index = cart.items.findIndex((item) => item.productId === productId);

    if (index > -1) {
      cart.items[index].quantity += parseInt(quantity);
    } else {
      cart.items.push({ productId, quantity: parseInt(quantity) });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ success: true, message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all carts
router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json({ success: true, count: carts.length, data: carts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete item from cart
router.delete("/cart/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { user } = req.body;

    if (!productId || !user) {
      return res
        .status(400)
        .json({ message: "productId and user are required" });
    }

    const cart = await Cart.findOne({ userId: user, status: "active" });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();

    await cart.save();

    res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
