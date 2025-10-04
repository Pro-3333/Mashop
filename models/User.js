const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: { type: DataTypes.ENUM('user','admin'), defaultValue: 'user' }
}, { timestamps: false });


module.exports = User;
