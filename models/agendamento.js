const Sequelize = require('sequelize')
const banco = require('./banco')

const Agendamento = banco.sequelize.define('agendamento', {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,        
    },
    especialidade: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    unidade: {
        type: Sequelize.STRING,
        allowNull: false
    },
    data: {
        type: Sequelize.DATE,
        allowNull: false,
    }
}, {
    timestamps: false
})

Agendamento.sync({force: false}) 

module.exports = Agendamento
