const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Autentifikacija – provjerava validan token i dodaje korisnika u req
const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Nedostaje ili je neispravan token" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Korisnik nije pronađen" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Neispravan token", error: error.message });
  }
};

// Admin middleware 
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Zabranjen pristup – samo za admina" });
  }
};

module.exports = { authMiddleware, adminMiddleware };
