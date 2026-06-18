const ActivityLog = require("../models/ActivityLog");

const logActivity = async (userId, action, details = "") => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details
    });
  } catch (err) {
    console.error("Greška prilikom logovanja aktivnosti:", err.message);
  }
};

module.exports = logActivity;
