const Sequelize = require('sequelize')
const banco = require('./banco')

const Usuario = banco.sequelize.define('usuarios', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    telefone: {
        type: Sequelize.STRING(15),
        allowNull: false
    },
    cpf: {
        type: Sequelize.STRING(14),
        allowNull: false,
        unique : true
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false
    },
    resetToken: {
        type: Sequelize.STRING,
        allowNull: true
    },
    tokenExpires: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    timestamps: false
})

Usuario.sync({force: false})

module.exports = Usuario