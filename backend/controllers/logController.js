const ActivityLog = require("../models/ActivityLog");

// GET /api/logs – vidi sve aktivnosti (admin only)
const getAllLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Greška pri ucitavanju logova" });
  }
};

module.exports = { getAllLogs };
