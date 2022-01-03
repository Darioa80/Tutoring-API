const dbModule = require("../util/connectMySQL");
const QueryDB = require("../util/QueryDatabase");

const getAllSubjects = async (req, res, next) => {
  const tableName = `${process.env.SQL_DB}.subjects`;

  let subjects;
  try {
    subjects = await QueryDB.QueryWholeDB(tableName);
  } catch (err) {
    console.log(err);
    return next(err);
  }
  res.status(201).json(subjects);
};

const getAllTopics = async (req, res, next) => {
  const tableName = `${process.env.SQL_DB}.topics`;
  let topics;
  try {
    topics = await QueryDB.QueryWholeDB(tableName);
  } catch (err) {
    return next(err);
  }

  res.status(201).json(topics);
};

exports.getAllSubjects = getAllSubjects;
exports.getAllTopics = getAllTopics;
