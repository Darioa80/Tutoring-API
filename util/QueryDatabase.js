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

exports.QueryWholeDB = QueryWholeDB;
exports.QueryDatabaseRow = QueryDatabaseRow;
exports.QueryColumn = QueryColumn;
