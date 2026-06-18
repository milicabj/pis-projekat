const City = require("../models/City");

// GET /api/cities
const getAllCities = async (req, res) => {
  try {
    const cities = await City.find().sort("name");
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: "Greška pri dohvatanju gradova" });
  }
};

// POST /api/cities
const createCity = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await City.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Grad već postoji" });
    }

    const city = new City({ name });
    await city.save();
    res.status(201).json(city);
  } catch (err) {
    res.status(500).json({ message: "Greška pri dodavanju grada" });
  }
};

// PUT /api/cities/:id
const updateCity = async (req, res) => {
  try {
    const updated = await City.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Grad nije pronađen" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Greška pri ažuriranju grada" });
  }
};

// DELETE /api/cities/:id
const deleteCity = async (req, res) => {
  try {
    const deleted = await City.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Grad nije pronađen" });
    res.json({ message: "Grad obrisan" });
  } catch (err) {
    res.status(500).json({ message: "Greška pri brisanju grada" });
  }
};

module.exports = {
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
};
