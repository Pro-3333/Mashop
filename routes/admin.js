const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const isAdmin = require('../middlewares/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// --- Configuration Storage Cloudinary ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products', // dossier Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage });

// --- Dashboard ---
router.get('/dashboard', isAdmin, (req, res) => {
  res.render('pages/admin/dashboard');
});

// --- Liste produits ---
router.get('/products', isAdmin, async (req, res) => {
  const products = await Product.findAll();
  res.render('pages/admin/manage-products', { products });
});

// --- Ajout produit ---
router.get('/products/add', isAdmin, (req, res) => {
  res.render('pages/admin/add-product');
});

router.post('/products/add', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const image = req.file ? req.file.path : null; // Cloudinary renvoie l’URL complète
    await Product.create({ name, description, price, stock, image });
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.send("Erreur lors de l'ajout du produit");
  }
});

// --- Modification produit ---
router.get('/products/edit/:id', isAdmin, async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  res.render('pages/admin/edit-product', { product });
});

router.post('/products/edit/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.send('Produit non trouvé');

    const updatedData = { name, description, price, stock };
    if (req.file) updatedData.image = req.file.path; // URL Cloudinary

    await Product.update(updatedData, { where: { id: req.params.id } });
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.send("Erreur lors de la modification du produit");
  }
});

// --- Supprimer produit ---
router.post('/products/delete/:id', isAdmin, async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.send('Erreur lors de la suppression du produit');
  }
});

module.exports = router;
