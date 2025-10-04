const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');



// Page inscription
router.get('/register', (req, res) => {
  res.render('register');
});

// Envoi formulaire inscription
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de l'inscription");
  }
});

// Page login
router.get('/login', (req, res) => {
  res.render('login');
});

// Envoi formulaire login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.send("Utilisateur non trouvé");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.send("Mot de passe incorrect");
    }

    // Stocker user en session
    req.session.user = { id: user.id, name: user.name, role: user.role };

    // Rediriger user / admin différemment
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.send("Erreur lors de la connexion");
  }
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;


module.exports = router;
