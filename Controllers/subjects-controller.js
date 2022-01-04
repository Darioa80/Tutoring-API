const dbModule = require("../util/connectMySQL");
const QueryDB = require("../util/QueryDatabase");

const getAllSubjects = async (req, res, next) => {
  const tableName = `${process.env.SQL_DB}.subjects`;
  dbModule.db.connect((err)=>{
    if(err){
      return next(err);
    }
});
  let subjects;
  try {
    subjects = await QueryDB.QueryWholeDB(tableName);
  } catch (err) {
    console.log(err);
    dbModule.closeConnection(err);
    return next(err);
  }
  res.status(201).json(subjects);
};

const getAllTopics = async (req, res, next) => {
  dbModule.db.connect((err)=>{
    if(err){
      return next(err);
    }
});
  const tableName = `${process.env.SQL_DB}.topics`;
  let topics;
  try {
    topics = await QueryDB.QueryWholeDB(tableName);
  } catch (err) {
    dbModule.closeConnection(err);
    return next(err);
  }

  res.status(201).json(topics);
};

exports.getAllSubjects = getAllSubjects;
exports.getAllTopics = getAllTopics;
