const mysql = require("mysql2");

//Create connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Cyclops2006!",
  database: "tutoring",
});

module.exports = db;
