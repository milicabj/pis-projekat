const Order = require("../models/Order");
const Product = require("../models/Product");
const logActivity = require("../utils/logActivity");


// GET /api/orders/mine – korisnik vidi svoje porudzbine
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Greška pri ucitavanju vaših porudzbina" });
  }
};

// GET /api/orders – admin vidi sve narudžbe
const getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Greška pri ucitavanju svih porudzbina" });
  }
};


// POST /api/orders – korisnik pravi porudzbinu
const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Porudzbinamora sadržati barem jedan proizvod" });
    }

    // Preračunavanje ukupne cijene
    let totalPrice = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: "Proizvod ne postoji: " + item.product });
      }
      totalPrice += product.price * item.quantity;
    }

    const order = new Order({
      user: req.user._id,
      items,
      totalPrice
    });

    const saved = await order.save();
    await logActivity(
        req.user._id,
        "create_order",
        `Naručeno ${items.length} proizvoda, ukupno ${totalPrice.toFixed(2)}€`
);

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Greška pri kreiranju porudzbine", error: err.message });
  }
};

// PUT /api/orders/:id – admin ažurira status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Porudzbina nije pronađena" });
    res.json(updated);

    await logActivity(
        req.user._id,
        "update_order_status",
        `Ažuriran status narudžbe ${req.params.id} na '${status}'`
);

  } catch (err) {
    res.status(500).json({ message: "Greška pri ažuriranju porudzbine" });
  }
};

// DELETE /api/orders/:id – admin otkazuje
const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Porudzbina nije pronađena" });
    res.json({ message: "Porudzbina otkazana" });
    await logActivity(
        req.user._id,
        "delete_order",
        `Otkazana narudžba ${req.params.id}`
);

  } catch (err) {
    res.status(500).json({ message: "Greška pri brisanju porudzbine" });
  }
};

module.exports = {
  getMyOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
