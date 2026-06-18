const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const cache = require("../middleware/cacheMiddleware");

router.get("/", cache("categories"), getAllCategories);
router.post("/", authMiddleware, adminMiddleware, createCategory);
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
