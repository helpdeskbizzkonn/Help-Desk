const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false, // This will allow insecure connections for development
  },
});

client
  .connect()
  .then(() => {
    console.log("Connected Successfully");
  })
  .catch((err) => {
    console.error("Connection error:", err.stack);
  });

module.exports = { client };
