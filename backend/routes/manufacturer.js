const express = require("express");
const router = express.Router();

const {
  getAllManufacturers,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer
} = require("../controllers/manufacturerController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.get("/", getAllManufacturers);
router.post("/", authMiddleware, adminMiddleware, createManufacturer);
router.put("/:id", authMiddleware, adminMiddleware, updateManufacturer);
router.delete("/:id", authMiddleware, adminMiddleware, deleteManufacturer);

module.exports = router;
