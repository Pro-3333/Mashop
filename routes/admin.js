const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const isAdmin = require('../middlewares/auth'); // middleware corrigé
const multer = require('multer');
const path = require('path');
const sequelize = require('../database');


// Configuration Multer pour upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // dossier pour stocker les images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- Dashboard ---
router.get('/dashboard', isAdmin, (req, res) => {
  res.render('pages/admin/dashboard');
});

// --- Liste des produits ---
router.get('/products', isAdmin, async (req, res) => {
  const products = await Product.findAll();
  res.render('pages/admin/manage-products', { products });
});

// --- Formulaire ajout produit ---
router.get('/products/add', isAdmin, (req, res) => {
  res.render('pages/admin/add-product');
});

// --- Traitement ajout produit ---
router.post('/products/add', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
  const image = req.file ? req.file.filename : null; // seulement le nom du fichier
  await Product.create({ name, description, price, stock, image });
  res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.send('Erreur lors de l\'ajout du produit');
  }
});

// --- Formulaire modification produit ---
router.get('/products/edit/:id', isAdmin, async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  res.render('pages/admin/edit-product', { product });
});

// --- Traitement modification produit ---
router.post('/products/edit/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.send('Produit non trouvé');

    const updatedData = { name, description, price, stock };
    if (req.file) updatedData.image = '/uploads/' + req.file.filename;

    await Product.update(updatedData, { where: { id: req.params.id } });
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.send('Erreur lors de la modification du produit');
  }
});

// --- Supprimer un produit ---
router.post('/products/delete/:id', isAdmin, async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.send('Erreur lors de la suppression du produit');
  }
});


// ✅ Gestion des commandes avec Sequelize
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');

// Liste des commandes
router.get('/manage-orders', isAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['email'] }, // informations utilisateur
        { model: OrderItem, include: Product } // détails produits
      ],
      order: [['createdAt', 'DESC']]
    });
    res.render('pages/admin/manage-orders', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des commandes');
  }
});

// Mise à jour du statut d’une commande
router.post('/update-order/:id', isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await Order.update({ status }, { where: { id: req.params.id } });
    res.redirect('/admin/manage-orders');
  } catch (err) {
    console.error('Erreur update order:', err);
    res.status(500).send(`Erreur update order: ${err.message}`);
    
  }
});
router.post('/orders/clear', async (req, res) => {
  try {
    // Supprime tous les items liés aux commandes
    await OrderItem.destroy({ where: {} });

    // Supprime toutes les commandes
    await Order.destroy({ where: {} });

    res.redirect('/admin/orders'); // retourne sur la page des commandes
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression des commandes');
  }
});



module.exports = router;
