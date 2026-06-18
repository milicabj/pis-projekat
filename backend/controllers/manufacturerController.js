const Manufacturer = require("../models/Manufacturer");

// GET /api/manufacturers
const getAllManufacturers = async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find().sort("name");
    res.json(manufacturers);
  } catch (err) {
    res.status(500).json({ message: "Greška pri dohvatanju proizvođača" });
  }
};

// POST /api/manufacturers
const createManufacturer = async (req, res) => {
  try {
    const { name, country } = req.body;

    const existing = await Manufacturer.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Proizvođač već postoji" });
    }

    const manufacturer = new Manufacturer({ name, country });
    await manufacturer.save();
    res.status(201).json(manufacturer);
  } catch (err) {
    res.status(500).json({ message: "Greška pri dodavanju proizvođača" });
  }
};

// PUT /api/manufacturers/:id
const updateManufacturer = async (req, res) => {
  try {
    const updated = await Manufacturer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Proizvođač nije pronađen" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Greška pri ažuriranju proizvođača" });
  }
};

// DELETE /api/manufacturers/:id
const deleteManufacturer = async (req, res) => {
  try {
    const deleted = await Manufacturer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Proizvođač nije pronađen" });
    res.json({ message: "Proizvođač obrisan" });
  } catch (err) {
    res.status(500).json({ message: "Greška pri brisanju proizvođača" });
  }
};

module.exports = {
  getAllManufacturers,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
};
