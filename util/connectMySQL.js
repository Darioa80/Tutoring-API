const mysql = require("mysql2");

//Create connection


const db = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DB,
});

const closeConnection = (err) => {
  db.end((err)=>{
  if(err) {
    return console.log('error:' + err.message);
  }
  console.log('Close the database connection.');
  });
  db = mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB,
  });
}

exports.db = db;
exports.closeConnection = closeConnection;