const db = require("../util/connectMySQL");

//QueryDatabase => retreives the entire database
const QueryWholeDB = (dbName) => {
  const sqlQuery = "SELECT * FROM ";

  return new Promise((resolve, reject) => {
    db.query(sqlQuery + dbName, (err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    });
  });
};

const QueryDatabaseRow = (SQLQuery, columnValue) => {
  return new Promise((resolve, reject) => {
    db.query(SQLQuery, [columnValue], (err, result) => {
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
    db.query(SQLQuery, (err, result) => {
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
  id = ""
) => {
  let sqlQuery = `SELECT ${table1}.*, ${table2}.${appendColumn} FROM ${table1} LEFT JOIN ${table2} ON ${table2}.${column2}=${table1}.${column1}`;
  if (id != "") {
    sqlQuery = sqlQuery + ` WHERE ${table1}.User_ID = ${id}`;
  }
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, (err, result) => {
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
