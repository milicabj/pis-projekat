const mongoose = require("mongoose");

const manufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  country: String
});

module.exports = mongoose.model("Manufacturer", manufacturerSchema);
