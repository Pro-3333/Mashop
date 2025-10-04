const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
  quantity: DataTypes.INTEGER,
  price: DataTypes.DECIMAL
}, { timestamps: false });

OrderItem.belongsTo(Order);
Order.hasMany(OrderItem);

OrderItem.belongsTo(Product);
Product.hasMany(OrderItem);

module.exports = OrderItem;
