const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2) },
  stock: { type: DataTypes.INTEGER },
  image: { type: DataTypes.STRING }
}, {
  tableName: 'products',   // ← Important si le nom exact diffère
  timestamps: false        // ← Désactive les colonnes createdAt / updatedAt si elles n’existent pas
});

module.exports = Product;
