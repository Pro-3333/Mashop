const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { sendOrderEmail } = require('../utils/mailer');

const nodemailer = require("nodemailer");

// Config Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USER, // depuis ton .env
    pass: process.env.MAIL_PASS, // depuis ton .env
  },
});


// === PANIER (en session) ===
let cart = [];

// --- Ajouter un produit au panier ---
router.post('/add/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).send('Produit non trouvé');

  const existing = cart.find(p => p.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product.dataValues, quantity: 1 });

  res.redirect('/cart');
});

// --- Voir le panier ---
router.get('/', (req, res) => {
  res.render('pages/cart', { cart });
});


// Afficher le formulaire de checkout
router.get('/checkout', (req, res) => {
  res.render('checkout', { cart }); // Passe le panier pour l'affichage
});

// --- Passer commande ---
router.post('/checkout', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !email || !address) return res.send('Veuillez remplir tous les champs obligatoires');

    // Calcul du total
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Création de la commande
    const order = await Order.create({
      UserId: req.session.user ? req.session.user.id : null,  // ✅ associe la commande au user si connecté
      total,
      status: 'En attente',
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_address: address
    });

    // Création des items de commande
    for (const item of cart) {
      await OrderItem.create({
        OrderId: order.id,
        ProductId: item.id,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Envoi d'email à l'admin
    let html = `
      <h2>Nouvelle commande</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Téléphone :</strong> ${phone || 'N/A'}</p>
      <p><strong>Adresse :</strong> ${address}</p>
      <h3>Produits :</h3>
      <ul>
    `;
    cart.forEach(item => {
      html += `<li>${item.name} - Quantité : ${item.quantity} - Prix : ${item.price} €</li>`;
    });
    html += `</ul><p><strong>Total :</strong> ${total} €</p>`;

    try {
      await transporter.sendMail({
        from: '"MaShop 🛒" <no-reply@mashop.com>',
        to: "admin@example.com", // ou email client
        subject: "Nouvelle commande",
        html: `
          <h2>Nouvelle commande reçue !</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${phone || "N/A"}</p>
          <p><strong>Adresse :</strong> ${address}</p>
          <h3>Produits :</h3>
          <ul>
            ${cart.map(item => `<li>${item.name} - Quantité : ${item.quantity} - Prix : ${item.price} €</li>`).join('')}
          </ul>
          <p><strong>Total :</strong> ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} €</p>
        `,
      });      
      console.log("✅ Email envoyé avec succès !");
    } catch (mailErr) {
      console.error("❌ Erreur lors de l'envoi d'email:", mailErr);
    }
    
    // Vider le panier
    cart = [];

    res.send(`
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
        background: linear-gradient(135deg, #ff8000, #ff5500);
        color: #fff;
        font-family: 'Poppins', sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">✅ Commande passée !</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Merci pour votre achat, votre commande est confirmée.</p>
        <a href="/" style="
          padding: 0.8rem 2rem; 
          background: #111; 
          color: #ff8000; 
          text-decoration: none; 
          font-weight: 600; 
          border-radius: 30px;
          transition: all 0.3s ease;
        " 
        onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)';" 
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
          ← Retour à l’accueil
        </a>
      </div>
    `);
      } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la création de la commande');
  }
});

// --- Supprimer un produit du panier ---
router.post('/remove/:id', (req, res) => {
  cart = cart.filter(p => p.id !== parseInt(req.params.id));
  res.redirect('/cart');
});

module.exports = router;
