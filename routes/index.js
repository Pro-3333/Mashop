const express = require('express');
const router = express.Router();  // ← C’est indispensable !
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
console.log(Order); 

// Page Mes commandes
router.get('/orders', async (req, res) => {
  try {
    if (!req.session.user) {
      // Si pas connecté → afficher un message sur une page dédiée
      return res.render('pages/auth-required', {
        message: "⚠️ Vous devez être connecté pour voir vos commandes.",
        loginUrl: "/login",
        registerUrl: "/register"
      });
    }

    // Si connecté → afficher uniquement ses commandes
    const orders = await Order.findAll({
      where: { UserId: req.session.user.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [['createdAt', 'DESC']],
    });

    res.render('Mes-commandes', { orders });
  } catch (error) {
    console.error(error);
    res.send('Erreur lors du chargement des commandes');
  }
});




router.get('/about', (req, res) => {
  res.render('pages/about');
});
// Page Contact
router.get('/contact', (req, res) => {
  res.render('pages/contact');
});

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));

router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Nouveau message de contact :', name, email, message);

  // Pour l'instant, juste afficher un message de confirmation
  res.send('<h1>Merci pour votre message ! Nous vous répondrons bientôt.</h1><a href="/">Retour à l’accueil</a>');
});

// Exemple de données statiques (vous pouvez les remplacer par des données de votre base)
const trendingProducts = [
  { id: 'product1', name: 'Chemise', price: 49, image: '/image/istockphoto-590039970-612x612.jpg' },
  { id: 'product2', name: 'Montre', price: 69, image: '/image/pexels-ferarcosn-190819.jpg' },
];

const newProducts = [
  { id: 'new1', name: 'Chaussure', price: 59, image: '/image/photo-1542291026-7eec264c27ff.jpeg' },
  
];

router.get("/search", async (req, res) => {
  const searchQuery = req.query.q || "";

  try {
    const products = await Product.findAll({
      where: {
        name: { [require("sequelize").Op.like]: `%${searchQuery}%` }
      }
    });

    res.render("searchResults", { products, query: searchQuery });
  } catch (err) {
    console.error("Erreur recherche:", err);
    res.status(500).send("Erreur serveur !");
  }
});

// Route home
router.get('/', (req, res) => {
  res.render('pages/home', { trendingProducts, newProducts });
});

module.exports = router;
