const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendOrderEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"MaShop" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
  } catch (err) {
    console.error('Erreur en envoyant l\'email :', err);
  }
}

module.exports = { sendOrderEmail };
