const dbModule = require("../util/connectMySQL");

//QueryDatabase => retreives the entire database
const QueryWholeDB = (dbName) => {
  const sqlQuery = "SELECT * FROM ";

  return new Promise((resolve, reject) => {
    dbModule.db.query(sqlQuery + dbName, (err, result) => {
      if (err) {
        dbModule.closeConnection(err);
        return reject(err);
      }

      return resolve(result);
    });
  });
};

const QueryDatabaseRow = (SQLQuery, columnValue) => {
  return new Promise((resolve, reject) => {
    dbModule.db.query(SQLQuery, [columnValue], (err, result) => {
      if (err) {
        return reject(err);
      }
      // console.log("query result: ", result);
      return resolve(result);
    });
  });
};

const QueryColumn = (SQLQuery) => {
  return new Promise((resolve, reject) => {
    dbModule.db.query(SQLQuery, (err, result) => {
      if (err) {
        return reject(err);
      }
      // console.log("query result: ", result);
      return resolve(result);
    });
  });
};

const JoinColumn = (
  table1,
  column1,
  table2,
  column2,
  appendColumn,
  id = "",
 
) => {
  let sqlQuery = `SELECT ${process.env.SQL_DB}.${table1}.*, ${process.env.SQL_DB}.${table2}.${appendColumn} FROM ${process.env.SQL_DB}.${table1} LEFT JOIN ${process.env.SQL_DB}.${table2} ON ${process.env.SQL_DB}.${table2}.${column2}=${process.env.SQL_DB}.${table1}.${column1}`;
  if (id != "") {
    sqlQuery = sqlQuery + ` WHERE ${table1}.User_ID = ${id}`;
  }
  sqlQuery = sqlQuery + ` AND ${process.env.SQL_DB}.${table1}.Date >= '${new Date().toISOString().slice(0, 10)}'`;
  return new Promise((resolve, reject) => {
    dbModule.db.query(sqlQuery, (err, result) => {
      if (err) {
        return reject(err);
      }
      // console.log("query result: ", result);
      return resolve(result);
    });
  });
};

exports.QueryWholeDB = QueryWholeDB;
exports.QueryDatabaseRow = QueryDatabaseRow;
exports.QueryColumn = QueryColumn;
exports.JoinColumn = JoinColumn;
