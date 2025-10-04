const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const Order = sequelize.define('Order', {
  status: { type: DataTypes.ENUM('pending','paid','shipped'), defaultValue: 'pending' },
  total: DataTypes.DECIMAL
}, { timestamps: true });

// Liaison avec User (créera UserId)
Order.belongsTo(User, { foreignKey: 'UserId' });

module.exports = Order;
