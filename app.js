const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const router = require("./Router/router");
const sequelize=require('./Configuration/db')
require('./Model/user')
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router);

sequelize.sync({
    alter:true
})

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    app.listen(process.env.PORT, () => {
      console.log(`server is running on port no:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

run();
