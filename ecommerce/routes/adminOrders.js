const express = require("express");
const router = express.Router();
const isAdmin = require('../middlewares/auth');
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");

const sequelize = require('../database');

// Liste des commandes
router.get("/", isAdmin, async (req, res) => {
  const orders = await Order.findAll({
    include: { model: OrderItem, include: Product }
  });
  res.render("pages/admin/manage-orders", { orders });
});

// Changer le statut d'une commande
router.post("/update/:id", isAdmin, async (req, res) => {
  const { status } = req.body;
  await Order.update({ status }, { where: { id: req.params.id } });
  res.redirect("/admin/orders");
});

module.exports = router;
