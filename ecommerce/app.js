const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const sequelize = require('./database');
const session = require('express-session');
const bcrypt = require('bcrypt');

const User = require('./models/User');

dotenv.config();
const app = express();




// Permet d'accéder aux fichiers du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true
}));

// Rendre l'utilisateur disponible dans toutes les vues
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Routes
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

app.use('/images', express.static('public/uploads'));
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/products', productRoutes);

// Synchronisation DB et création admin si inexistant
sequelize.sync({ force: false }).then(async () => {
  console.log("DB synchronisée");

  const adminEmail = 'admin@ecommerce.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if(!existingAdmin){
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Utilisateur admin créé :', adminEmail, 'Mot de passe : admin123');
  } else {
    console.log('Admin déjà existant :', adminEmail);
  }
});

const adminOrdersRoutes = require("./routes/adminOrders");
app.use("/admin/manage-orders", adminOrdersRoutes);

// Servir les fichiers statiques depuis public
app.use(express.static(path.join(__dirname, 'public')));




// Démarrage serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur lancé sur http://0.0.0.0:${PORT}`);
});

