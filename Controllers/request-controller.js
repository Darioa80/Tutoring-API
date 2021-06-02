const HttpError = require("../http-error");
const Request = require("../RequestSchema");
const db = require("../util/connectMySQL");

const AvailableTimes = async (req, res, next) => {
  const { date } = req.body;

  const initialTimes = initiateTimes(date);
  const sqlQuery = "SELECT Time FROM tutoring_requests WHERE Date = ?";
  let busyTimes;
  try {
    busyTimes = await QueryForTimes(sqlQuery, date);
  } catch (err) {
    console.log(err);
    /*const error = new HttpError(
      "Something went wrong, please try again later",
      500
    );*/
    return next(error);
  }
  console.log(busyTimes);
  let resultingTimes = initialTimes.filter((time) => {
    for (let i = 0; i < busyTimes.length; i++) {
      console.log(time);
      if (busyTimes[i]["Time"] == time) {
        return false;
      }
    }
    return true;
  });

  res.status(201).json({ times: resultingTimes }).send();
};

const QueryForTimes = (sqlQuery, date) => {
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, [date], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const initiateTimes = (date) => {
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

  const numDay = new Date().getDay(date);
  let dayCategory;
  if (numDay == 0 || numDay == 6) {
    dayCategory = "weekend";
  } else {
    dayCategory = "weekday";
  }
  return Times[dayCategory];
};

const newRequest = async (req, res, next) => {
  const { userID, time, date, subject_ID, location, topics } = req.body;

  const newRequest = new Request(
    userID,
    time,
    date,
    subject_ID,
    location,
    topics
  );

  let sql = "INSERT INTO tutoring_requests SET ?";
  let query = db.query(sql, newRequest, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.status(201).send();
  });
};

exports.newRequest = newRequest;
exports.AvailableTimes = AvailableTimes;
