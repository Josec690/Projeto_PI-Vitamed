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
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        unique : true
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

Usuario.sync({force: false})

module.exports = Usuario