const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./banco').sequelize;

const Postmr = sequelize.define('Postmr', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tokenExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = Postmr;