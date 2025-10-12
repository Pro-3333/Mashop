const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const sequelize = require('./database');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const cloudinary = require('cloudinary').v2; // ← ajouté

dotenv.config();
const app = express();

// --- Configuration Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true
}));

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

app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/products', productRoutes);

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
    console.log('Admin créé :', adminEmail);
  }
});

const adminOrdersRoutes = require("./routes/adminOrders");
app.use("/admin/manage-orders", adminOrdersRoutes);

app.get('/download', (req, res) => {
  res.render('pages/download');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur lancé sur http://0.0.0.0:${PORT}`);
});
