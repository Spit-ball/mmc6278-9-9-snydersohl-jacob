const mysql = require("mysql2");

const config = process.env.JAWSDB_URL || {
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  database: process.env.DB_NAME,
};
const connection = mysql.createPool(config);

module.exports = connection.promise();
