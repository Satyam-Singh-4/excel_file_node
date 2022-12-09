const { Sequelize } = require("sequelize");
const sequelize = require('../Configuration/db');
const user = sequelize.define(
  "User",
  {
   
    Name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    Age: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
module.exports = user;
