const dbModule = require("../util/connectMySQL");
const QueryDB = require("../util/QueryDatabase");

const getAllSubjects = async (req, res, next) => {
  const tableName = "tutoring.subjects";

  let subjects;
  try {
    subjects = await QueryDB.QueryWholeDB(tableName);
  } catch (err) {

    return next(err);
  }
  res.status(201).json(subjects);
};

const getAllTopics = async (req, res, next) => {
  const tableName = "tutoring.topics";
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
