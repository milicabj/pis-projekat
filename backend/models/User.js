const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City" }
});

module.exports = mongoose.model("User", userSchema);
