const express = require("express");
const router = express.Router();

const {
  getMyOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/orderController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// korisnik vidi svoje porudzbine
router.get("/mine", authMiddleware, getMyOrders);

// admin vidi sve
router.get("/", authMiddleware, adminMiddleware, getAllOrders);

// korisnik kreira porudzbinu
router.post("/", authMiddleware, createOrder);

// admin ažurira status
router.put("/:id", authMiddleware, adminMiddleware, updateOrderStatus);

// admin briše porudzbinu
router.delete("/:id", authMiddleware, adminMiddleware, deleteOrder);

module.exports = router;
