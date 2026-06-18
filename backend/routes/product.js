const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const cache = require("../middleware/cacheMiddleware");

router.get("/", cache("products"), getAllProducts);
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
