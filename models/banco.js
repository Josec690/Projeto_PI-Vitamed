const Sequelize = require('sequelize')

const commonOptions = {
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: process.env.DB_SSL === 'true'
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
        : {}
}

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, commonOptions)
    : new Sequelize(
        process.env.DB_NAME || 'projeto',
        process.env.DB_USERNAME || 'root',
        process.env.DB_PASSWORD || '',
        {
            ...commonOptions,
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306
        }
    )

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize 
}
