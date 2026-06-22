this will break ci
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
require("./models/Category");
require("./models/Manufacturer");
require("./models/City");
require("./models/Order");
require("./models/ActivityLog");

const productRoutes = require("./routes/product");
const cityRoutes = require("./routes/city");
const manufacturerRoutes = require("./routes/manufacturer");
const categoryRoutes = require("./routes/category");
const orderRoutes = require("./routes/order");
const logRoutes = require("./routes/log");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:4200",
  credentials: true
}));

app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Previše zahtjeva, pokušajte ponovo kasnije." }
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Previše pokušaja prijave, pokušajte ponovo za 15 minuta." }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Povezan sa bazom"))
  .catch(err => console.error("Greška pri povezivanju sa bazom!:", err));

app.get("/", (req, res) => {
  res.send("Pharma backend radi!");
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/manufacturers", manufacturerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/logs", logRoutes);

app.listen(5000, () => {
  console.log("Server sluša na http://localhost:5000");
});
