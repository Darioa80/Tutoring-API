const mysql = require("mysql2");

//Create connection



let db = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DB,
});


const closeConnection = (err) => {
  db.end((err)=>{
  console.log('Close the database connection.');
  if(err) {
    return console.log('error:' + err.message);
  }
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