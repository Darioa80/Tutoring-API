const db = require("../util/connectMySQL");
const QueryDB = require("../util/QueryDatabase");

const getAllSubjects = async (req, res, next) => {
  const tableName = "tutoring.subjects";
  let subjects;
  try {
    subjects = await QueryDB.QueryWholeDB(tableName);
  } catch (err) {
    console.log(err);
    return next(err);
  }
  console.log(subjects);
  res.status(201).json(subjects);
};

exports.getAllSubjects = getAllSubjects;
