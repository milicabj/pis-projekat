const express = require("express");
const router = express.Router();
const { getAllLogs } = require("../controllers/logController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// Samo admin može vidjeti logove
router.get("/", authMiddleware, adminMiddleware, getAllLogs);

module.exports = router;
