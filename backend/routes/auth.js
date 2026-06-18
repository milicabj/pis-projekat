const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const mongoose = require("mongoose");


// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("city");
    if (!user) return res.status(401).json({ message: "Neispravan email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Pogrešna lozinka" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Greška pri loginu", error: err.message });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, city } = req.body;

  try {
    // Provjera da li korisnik već postoji
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email već postoji" });
    }

    // Hashovanje lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kreiranje novog korisnika
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      city: new mongoose.Types.ObjectId(city),
    });

    await newUser.save();

    //Generiši token odmah po registraciji
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Pošalji token i korisnika kao odgovor
    res.status(201).json({
      message: "Registracija uspješna",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        city: newUser.city
      }
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Greška pri registraciji", error: err.message });
  }
});


module.exports = router;


