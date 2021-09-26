const HttpError = require("../http-error");
const Request = require("../RequestSchema");
const db = require("../util/connectMySQL");

const moment = require("moment");

const QueryDB = require("../util/QueryDatabase");

const SearchUserRequests = async (req, res, next) => {
  //needs to be authorized and checked that the userID matches the logged in user
  const { userID } = req.params;

  // const { userId: currentID } = req.userData; (will come back to this for authorization)

  const sqlQuery =
    "SELECT Subject_ID, Time, Date, Location FROM tutoring_requests WHERE User_ID = ?";
  let appointments;
  try {
    // appointments = await QueryDB.QueryDatabaseRow(sqlQuery, userID);
    appointments = await QueryDB.JoinColumn(
      "tutoring_requests",
      "Subject_ID",
      "subjects",
      "Subject_ID",
      "Subject_Name",
      userID
    );
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.status(201).json({ apps: appointments }).send();
};

const AvailableTimes = async (req, res, next) => {
  const { date } = req.body;
  const weekDayNum = moment(date).weekday();
  console.log(weekDayNum);
  let parsed_date = date.split("T")[0];
  const initialTimes = initiateTimes(weekDayNum);
  const sqlQuery = "SELECT Time FROM tutoring_requests WHERE Date = ?";
  let SQLData;
  try {
    SQLData = await QueryDB.QueryDatabaseRow(sqlQuery, parsed_date);
  } catch (err) {
    console.log(err);
    /*const error = new HttpError(
      "Something went wrong, please try again later",
      500
    );*/
    return next(error);
  }
  console.log(SQLData);
  let resultingTimes = initialTimes.filter((time) => {
    for (let i = 0; i < SQLData.length; i++) {
      if (SQLData[i]["Time"] == time) {
        return false;
      }
    }
    return true;
  });

  res.status(201).json({ times: resultingTimes }).send();
};

const AvailableSubjects = async (req, res, next) => {
  const sqlQuery = "SELECT Subject_ID, Subject_Name, Rate FROM subjects";
  let SQLData;

  try {
    SQLData = await QueryDB.QueryColumn(sqlQuery);
  } catch (err) {
    console.log(err);
    /*const error = new HttpError(
      "Something went wrong, please try again later",
      500
    );*/
    return next(error);
  }
  let returnNameObject = {};
  let returnRateObject = {};
  for (let i = 0; i < SQLData.length; i++) {
    let currentElement = SQLData[i];
    returnNameObject[currentElement["Subject_ID"]] =
      currentElement["Subject_Name"];
    returnRateObject[currentElement["Subject_ID"]] = currentElement["Rate"];
  }
  res.status(201).json([returnNameObject, returnRateObject]).send();
};

const initiateTimes = (weekDayNum) => {
  const Times = {
    weekend: [
      "12:00:00",
      "13:00:00",
      "14:00:00",
      "15:00:00",
      "16:00:00",
      "17:00:00",
      "18:00:00",
    ],
    weekday: ["18:00:00", "19:00:00", "20:00:00"],
  };

  let dayCategory;
  if (weekDayNum == 0 || weekDayNum == 6) {
    dayCategory = "weekend";
  } else {
    dayCategory = "weekday";
  }
  return Times[dayCategory];
};

const cancelRequest = async (req, res, next) => {
  const { reqID } = req.params;
  let sql = "DELETE FROM tutoring_requests WHERE Request_ID = ?";
  try {
    await QueryDB.QueryDatabaseRow(sql, reqID);
  } catch (err) {
    console.log(err);
    return next(err);
  }
  res.status(201).json({ message: "Tutoring appointment canceled" }).send();
};

const newRequest = async (req, res, next) => {
  const { user_id, time, date, subject_id, location, topics } = req.body;

  const newRequest = new Request(
    user_id,
    time,
    date.split("T")[0],
    subject_id,
    location,
    topics
  );
  console.log(newRequest);
  let sql = "INSERT INTO tutoring_requests SET ?";
  let query = db.query(sql, newRequest, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.status(201).send();
  });
};

const EditRequest = async (req, res, next) => {
  const { reqID } = req.params;
  const { user_id, time, date, subject_id, location, topics } = req.body;

  const sql = `UPDATE tutoring_requests SET Time="${time}", Date="${
    date.split("T")[0]
  }" WHERE Request_ID = ${reqID};`;

  try {
    await QueryDB.QueryDatabaseRow(sql, reqID);
  } catch (err) {
    next(err);
  }
  res.status(201).send();
};

exports.newRequest = newRequest;
exports.AvailableTimes = AvailableTimes;
exports.AvailableSubjects = AvailableSubjects;
exports.SearchUserRequests = SearchUserRequests;
exports.cancelRequest = cancelRequest;
exports.EditRequest = EditRequest;
