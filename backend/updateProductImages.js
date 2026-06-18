const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");
const productImages = require("./productImages");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Povezan sa bazom");

    for (const [name, imageUrl] of Object.entries(productImages)) {
      const result = await Product.updateOne({ name }, { imageUrl });
      if (result.matchedCount === 0) {
        console.log(`Proizvod nije pronađen: ${name}`);
      } else {
        console.log(`Ažurirano: ${name}`);
      }
    }

    console.log("Slike proizvoda su ažurirane ✅");
    process.exit();
  })
  .catch((err) => {
    console.error("Greška:", err);
    process.exit(1);
  });
