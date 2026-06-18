const Category = require("../models/Category");
const redis = require("../cache/redisClient");

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Greška pri ucitavanju kategorija" });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Kategorija već postoji" });
    }

    const category = new Category({ name, description, imageUrl });
    await category.save();
    await redis.del("categories:/api/categories");
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Greška pri dodavanju kategorije" });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, imageUrl },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Kategorija nije pronađena" });
    await redis.del("categories:/api/categories");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Greška pri ažuriranju kategorije" });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Kategorija nije pronađena" });
    await redis.del("categories:/api/categories");
    res.json({ message: "Kategorija obrisana" });
  } catch (err) {
    res.status(500).json({ message: "Greška pri brisanju kategorije" });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
