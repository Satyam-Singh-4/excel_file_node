const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("Task6", "root", "Tectoro@123", {
  dialect: "mysql",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

module.exports = sequelize;