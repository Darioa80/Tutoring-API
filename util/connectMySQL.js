const mysql = require("mysql2");

//Create connection

const pool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DB,
})



exports.pool = pool;