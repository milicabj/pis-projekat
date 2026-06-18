const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const City = require("./models/City");
const Category = require("./models/Category");
const Manufacturer = require("./models/Manufacturer");
const Product = require("./models/Product");
const User = require("./models/User");
const productImages = require("./productImages");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Povezan sa bazom");

    await City.deleteMany();
    await Category.deleteMany();
    await Manufacturer.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const cities = await City.insertMany([
      { name: "Podgorica" },
      { name: "Nikšić" },
      { name: "Budva" },
      { name: "Bar" },
      { name: "Herceg Novi" },
      { name: "Kotor" },
      { name: "Tivat" },
      { name: "Cetinje" },
    ]);

    const categories = await Category.insertMany([
      {
        name: "ZDRAVLJE",
        description: "Lijekovi i medicinski proizvodi",
        imageUrl: "https://img.icons8.com/?size=100&id=1076&format=png&color=035f19",
      },
      {
        name: "LJEPOTA I NJEGA",
        description: "Njega lica i tijela",
        imageUrl: "https://img.icons8.com/?size=100&id=yUOHnxVyYcKz&format=png&color=035f19",
      },
      {
        name: "ZDRAVLJE DJECE",
        description: "Proizvodi za bebe i djecu",
        imageUrl: "https://img.icons8.com/?size=100&id=wkXRinBf9Ggm&format=png&color=035f19",
      },
      {
        name: "SUPLEMENTI I PREHRANA",
        description: "Vitamini i dodaci ishrani",
        imageUrl: "https://img.icons8.com/?size=100&id=DXA68dYPj48g&format=png&color=035f19",
      },
      {
        name: "LIČNA HIGIJENA",
        description: "Proizvodi za svakodnevnu higijenu",
        imageUrl: "https://img.icons8.com/?size=100&id=992&format=png&color=035f19",
      },
    ]);

    const manufacturers = await Manufacturer.insertMany([
      { name: "Galenika", country: "Srbija" },
      { name: "Bosnalijek", country: "BiH" },
      { name: "Hemofarm", country: "Srbija" },
      { name: "Bayer", country: "Njemačka" },
      { name: "La Roche-Posay", country: "Francuska" },
      { name: "Eucerin", country: "Njemačka" },
      { name: "Solgar", country: "SAD" },
      { name: "Chicco", country: "Italija" },
    ]);

    const c = {};
    categories.forEach((category) => {
      c[category.name] = category._id;
    });

    const m = {};
    manufacturers.forEach((manufacturer) => {
      m[manufacturer.name] = manufacturer._id;
    });

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin",
      email: "admin@pharma.com",
      password: hashedPassword,
      role: "admin",
      city: cities[0]._id,
    });

    await User.create({
      name: "Korisnik",
      email: "user@pharma.com",
      password: await bcrypt.hash("user123", 10),
      role: "user",
      city: cities[1]._id,
    });

    await Product.insertMany([
      {
        name: "Brufen 400mg",
        description: "Lijek za bolove i temperaturu",
        price: 4.99,
        imageUrl: productImages["Brufen 400mg"],
        category: c["ZDRAVLJE"],
        manufacturer: m["Galenika"],
      },
      {
        name: "Paracetamol 500mg",
        description: "Lijek za bolove i temperaturu",
        price: 3.49,
        imageUrl: productImages["Paracetamol 500mg"],
        category: c["ZDRAVLJE"],
        manufacturer: m["Hemofarm"],
      },
      {
        name: "Aspirin 500mg",
        description: "Tablete protiv bolova",
        price: 4.2,
        imageUrl: productImages["Aspirin 500mg"],
        category: c["ZDRAVLJE"],
        manufacturer: m["Bayer"],
      },
      {
        name: "Panklav 875mg",
        description: "Antibiotik širokog spektra",
        price: 9.99,
        imageUrl: productImages["Panklav 875mg"],
        category: c["ZDRAVLJE"],
        manufacturer: m["Bosnalijek"],
      },
      {
        name: "Amoksicilin 500mg",
        description: "Antibiotik koji se koristi po preporuci ljekara",
        price: 7.8,
        imageUrl: productImages["Amoksicilin 500mg"],
        category: c["ZDRAVLJE"],
        manufacturer: m["Hemofarm"],
      },
      {
        name: "Vitamin C 1000mg",
        description: "Dodatak ishrani za imunitet",
        price: 6.99,
        imageUrl: productImages["Vitamin C 1000mg"],
        category: c["SUPLEMENTI I PREHRANA"],
        manufacturer: m["Solgar"],
      },
      {
        name: "Vitamin D3",
        description: "Vitamin za kosti i imunitet",
        price: 7.5,
        imageUrl: productImages["Vitamin D3"],
        category: c["SUPLEMENTI I PREHRANA"],
        manufacturer: m["Solgar"],
      },
      {
        name: "Magnezijum 300mg",
        description: "Suplement za mišiće, umor i iscrpljenost",
        price: 8.2,
        imageUrl: productImages["Magnezijum 300mg"],
        category: c["SUPLEMENTI I PREHRANA"],
        manufacturer: m["Solgar"],
      },
      {
        name: "Omega 3",
        description: "Dodatak ishrani sa ribljim uljem",
        price: 12.99,
        imageUrl: productImages["Omega 3"],
        category: c["SUPLEMENTI I PREHRANA"],
        manufacturer: m["Solgar"],
      },
      {
        name: "Effaclar Gel",
        description: "Gel za čišćenje masne i problematične kože",
        price: 15.99,
        imageUrl: productImages["Effaclar Gel"],
        category: c["LJEPOTA I NJEGA"],
        manufacturer: m["La Roche-Posay"],
      },
      {
        name: "Eucerin Hyaluron Filler",
        description: "Dnevna krema za hidrataciju i njegu kože",
        price: 22.5,
        imageUrl: productImages["Eucerin Hyaluron Filler"],
        category: c["LJEPOTA I NJEGA"],
        manufacturer: m["Eucerin"],
      },
      {
        name: "Pantenol Krema",
        description: "Krema za njegu suve i iritirane kože",
        price: 5.6,
        imageUrl: productImages["Pantenol Krema"],
        category: c["LJEPOTA I NJEGA"],
        manufacturer: m["Galenika"],
      },
      {
        name: "Eucerin pH5 Losion",
        description: "Losion za osjetljivu kožu tijela",
        price: 13.4,
        imageUrl: productImages["Eucerin pH5 Losion"],
        category: c["LJEPOTA I NJEGA"],
        manufacturer: m["Eucerin"],
      },
      {
        name: "Chicco Baby Kupka",
        description: "Blaga kupka za bebe",
        price: 6.3,
        imageUrl: productImages["Chicco Baby Kupka"],
        category: c["ZDRAVLJE DJECE"],
        manufacturer: m["Chicco"],
      },
      {
        name: "Dječiji sirup za imunitet",
        description: "Dodatak ishrani za djecu",
        price: 8.9,
        imageUrl: productImages["Dječiji sirup za imunitet"],
        category: c["ZDRAVLJE DJECE"],
        manufacturer: m["Bosnalijek"],
      },
      {
        name: "Dječiji vitamin D",
        description: "Vitamin D kapi za djecu",
        price: 6.8,
        imageUrl: productImages["Dječiji vitamin D"],
        category: c["ZDRAVLJE DJECE"],
        manufacturer: m["Chicco"],
      },
      {
        name: "Baby zaštitna krema",
        description: "Krema za osjetljivu dječiju kožu",
        price: 5.9,
        imageUrl: productImages["Baby zaštitna krema"],
        category: c["ZDRAVLJE DJECE"],
        manufacturer: m["Chicco"],
      },
      {
        name: "Listerine Cool Mint",
        description: "Vodica za ispiranje usta",
        price: 5.99,
        imageUrl: productImages["Listerine Cool Mint"],
        category: c["LIČNA HIGIJENA"],
        manufacturer: m["Bayer"],
      },
      {
        name: "Sensodyne Repair",
        description: "Pasta za zube",
        price: 4.5,
        imageUrl: productImages["Sensodyne Repair"],
        category: c["LIČNA HIGIJENA"],
        manufacturer: m["Bayer"],
      },
      {
        name: "Medicinski sapun",
        description: "Sapun za svakodnevnu higijenu",
        price: 2.8,
        imageUrl: productImages["Medicinski sapun"],
        category: c["LIČNA HIGIJENA"],
        manufacturer: m["Galenika"],
      },
      {
        name: "Antibakterijski gel",
        description: "Gel za dezinfekciju ruku",
        price: 3.2,
        imageUrl: productImages["Antibakterijski gel"],
        category: c["LIČNA HIGIJENA"],
        manufacturer: m["Hemofarm"],
      },
    ]);

    console.log("Seed uspješno završen ✅");
    process.exit();
  })
  .catch((err) => {
    console.error("Greška pri seedovanju:", err);
    process.exit(1);
  });