const Product = require("../models/Product");
const Category = require("../models/Category");
const Manufacturer = require("../models/Manufacturer");
const redis = require("../cache/redisClient");


const getAllProducts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' }; // traži po imenu
    }

    const products = await Product.find(filter)
      .populate("category")
      .populate("manufacturer");

    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Greška pri učitavanju proizvoda",
      error: err.message,
    });
  }
};



const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, manufacturer, imageUrl } = req.body;

    const mongoose = require("mongoose");
    //provjera je li vazeci id
    if (!mongoose.Types.ObjectId.isValid(category) || !mongoose.Types.ObjectId.isValid(manufacturer)) {
      return res.status(400).json({ message: "Nevažeći ID format za category ili manufacturer" });
    }

    const categoryExists = await Category.findById(category);
    const manufacturerExists = await Manufacturer.findById(manufacturer);

    if (!categoryExists || !manufacturerExists) {
      return res.status(400).json({ message: "Neispravan category ili manufacturer ID" });
    }

    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      category,
      manufacturer,
    });

    const saved = await product.save();
    await redis.del("products:/api/products");
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Greška prilikom dodavanja proizvoda", error: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Proizvod nije pronađen" });
    }
    await redis.del("products:/api/products");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Greška prilikom ažuriranja", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Proizvod nije pronađen" });
    }
    await redis.del("products:/api/products");
    res.json({ message: "Proizvod obrisan" });
  } catch (error) {
    res.status(500).json({ message: "Greška prilikom brisanja", error: error.message });
  }
};


module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};


