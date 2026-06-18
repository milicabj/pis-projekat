const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: "Manufacturer" }
});

module.exports = mongoose.model("Product", productSchema);
