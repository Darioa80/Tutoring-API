const mysql = require("mysql2");

//Create connection
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: "tutoring",
});

module.exports = db;
