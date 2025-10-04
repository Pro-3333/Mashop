const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  const products = await Product.findAll();
  res.render('pages/products', { products });
});

// Afficher un produit unique
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findByPk(productId); // selon ton ORM
  if (!product) return res.status(404).send('Produit non trouvé');
  res.render('pages/product', { product });
});


module.exports = router;
