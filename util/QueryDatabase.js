const db = require("../util/connectMySQL");

const QueryDatabse = (SQLQuery, columnValue) => {
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

exports.QueryDatabse = QueryDatabse;
exports.QueryColumn = QueryColumn;
