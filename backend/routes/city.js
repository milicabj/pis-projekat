const express = require("express");
const router = express.Router();

const {
  getAllCities,
  createCity,
  updateCity,
  deleteCity
} = require("../controllers/cityController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.get("/", getAllCities);
router.post("/", authMiddleware, adminMiddleware, createCity);
router.put("/:id", authMiddleware, adminMiddleware, updateCity);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCity);

module.exports = router;
