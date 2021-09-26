const db = require("../util/connectMySQL");
const QueryDB = require("../util/QueryDatabase");

const getAllSubjects = async (req, res, next) => {
  const tableName = "tutoring.subjects";

  let subjects;
  try {
    subjects = await QueryDB.QueryWholeDB(tableName);
    // subjects = await QueryDB.JoinColumn(
    //   table1,
    //   column1,
    //   table2,
    //   column2,
    //   appendColumn
    // );
  } catch (err) {
    console.log(err);
    return next(err);
  }
  console.log(subjects);
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
  console.log(topics);
  res.status(201).json(topics);
};

exports.getAllSubjects = getAllSubjects;
exports.getAllTopics = getAllTopics;
