const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');

// Route de recherche
router.get('/', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.render('searchResults', { products: [], query: "" });
    }

    // Recherche dans le nom ou la description du produit
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      }
    });

    res.render('searchResults', { products, query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur lors de la recherche.");
  }
});

module.exports = router;
