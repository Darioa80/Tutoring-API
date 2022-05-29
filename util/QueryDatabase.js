const db = require("../util/connectMySQL");

//QueryDatabase => retreives the entire database
const QueryWholeDB = (dbName) => {
//   dbModule.db.connect((err)=>{
//     if(err){
//       dbModule.closeConnection(err);
//       return err;
//     }
// });

  const sqlQuery = "SELECT * FROM ";

  return new Promise((resolve, reject) => {
    // dbModule.db.query(sqlQuery + dbName, (err, result) => {
    //   if (err) {
    //     dbModule.closeConnection(err);
    //     return reject(err);
    //   }

    //   return resolve(result);
    // });

    db.pool.getConnection(function(err, connection){
      connection.query(sqlQuery + dbName, (err, result) => {
          if (err) {
            connection.release();
            return reject(err);
          }
          connection.release();
          return resolve(result);
          
        });
    })

  });
};

const QueryDatabaseRow = (SQLQuery, columnValue) => {
  return new Promise((resolve, reject) => {
  db.pool.getConnection(function(err, connection){
    connection.query(SQLQuery, [columnValue], (err, result) => {
          if (err) {
            connection.release();
            return reject(err);
          }  
          connection.release();
          return resolve(result);
        });
      })
  
    });
  };

const QueryColumn = (SQLQuery) => {
  return new Promise((resolve, reject) => {
    db.pool.getConnection(function(err, connection){
      connection.query(SQLQuery, (err, result) => {
        if (err) {

          return reject(err);
        }
        // console.log("query result: ", result);
        connection.release();
        return resolve(result);
      });
    })
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
    sqlQuery = sqlQuery + ` WHERE ${table1}.User_ID = ${id} AND Canceled IS NULL`;
  }
  sqlQuery = sqlQuery + ` AND ${process.env.SQL_DB}.${table1}.Date >= '${new Date().toISOString().slice(0, 10)}'`;
  return new Promise((resolve, reject) => {
    db.pool.getConnection(function(err, connection){
      connection.query(sqlQuery, (err, result) => {
        if (err) {
          return reject(err);
        }
        // console.log("query result: ", result);
        connection.release();
        return resolve(result);
      });
    })
  });
};

const UsersAndRequests =() => {
  const date = new Date();

let SQLQuery = `SELECT * FROM ${process.env.SQL_DB}.tutoring_requests LEFT JOIN ${process.env.SQL_DB}.users ON ${process.env.SQL_DB}.tutoring_requests.User_ID = ${process.env.SQL_DB}.users.User_ID LEFT JOIN ${process.env.SQL_DB}.subjects ON ${process.env.SQL_DB}.tutoring_requests.Subject_ID = ${process.env.SQL_DB}.subjects.Subject_ID WHERE ${process.env.SQL_DB}.tutoring_requests.Date >= "${date.getFullYear()}-${date.getMonth()+1}-${date.getDay()}" AND ${process.env.SQL_DB}.tutoring_requests.Canceled IS NULL`;
return new Promise((resolve, reject) => {
  db.pool.getConnection(function(err, connection){
    connection.query(SQLQuery, (err, result) => {
      if (err) {
        return reject(err);
      }
      connection.release();
      return resolve(result);
    });
  })
});
}

const UpdateColumn = (tableName, columnName, columnValue, idName, idValue) =>{

  const sql = `UPDATE ${process.env.SQL_DB}.${tableName} SET ${columnName} = '${columnValue}' WHERE ${idName} = ${idValue}`;
  console.log(sql);
  return new Promise((resolve, reject) => {db.pool.getConnection(function(err, connection){
    connection.query(sql, (err, result) => {
          if (err) {
            connection.release();
            return reject(err);
          }  
          connection.release();
          console.log(result);
          return resolve(result);
        });
  
    });
  });


}

exports.QueryWholeDB = QueryWholeDB;
exports.QueryDatabaseRow = QueryDatabaseRow;
exports.QueryColumn = QueryColumn;
exports.JoinColumn = JoinColumn;
exports.UsersAndRequests = UsersAndRequests;
exports.UpdateColumn = UpdateColumn;
