const HttpError = require("../http-error");
const Request = require("../RequestSchema");
const dbModule = require("../util/connectMySQL");
const stripe = require("../util/stripe");
const moment = require("moment");
const db = require("../util/connectMySQL");


const QueryDB = require("../util/QueryDatabase");

const SearchUserRequests = async (req, res, next) => {
  //needs to be authorized and checked that the userID matches the logged in user
  const { userID } = req.params;
  const sqlQuery =
    `SELECT Subject_ID, Time, Date, Location FROM ${process.env.SQL_DB}.tutoring_requests WHERE User_ID = ?`;
  let appointments;
  try {
    appointments = await QueryDB.JoinColumn(
      "tutoring_requests",
      "Subject_ID",
      "subjects",
      "Subject_ID",
      "Subject_Name",
      userID
    );

    
  } catch (err) {

    return next(err);
  }

  res.status(201).json({ apps: appointments }).send();
};

const AvailableTimes = async (req, res, next) => {
  const { date } = req.body;
  const weekDayNum = moment(date).weekday();
  let parsed_date = date.split("T")[0];
  const initialTimes = initiateTimes(weekDayNum);
  const sqlQuery = `SELECT Time FROM ${process.env.SQL_DB}.tutoring_requests WHERE Date = ?`;
  let SQLData;
  try {
    SQLData = await QueryDB.QueryDatabaseRow(sqlQuery, parsed_date);
  } catch (err) {

    return next(error);
  }

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
  const sqlQuery = `SELECT Subject_ID, Subject_Name, Rate FROM ${process.env.SQL_DB}.subjects`;
  let SQLData;

  try {
    SQLData = await QueryDB.QueryColumn(sqlQuery);
  } catch (err) {
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
  let sql = `DELETE FROM ${process.env.SQL_DB}.tutoring_requests WHERE Request_ID = ?`;
  try {
    await QueryDB.QueryDatabaseRow(sql, reqID);
  } catch (err) {

    return next(err);
  }
  res.status(201).json({ message: "Tutoring appointment canceled" }).send();
};

const sendNewRequest = async (user_id, time, date, subject_id, location, topics) =>{

  const newRequest = new Request(
    user_id,
    time,
    date.split("T")[0],
    subject_id,
    location,
    topics
  );

  let sql = `INSERT INTO ${process.env.SQL_DB}.tutoring_requests SET ?`;
  db.pool.getConnection(function(err, connection){
    connection.query(sql, newRequest, (err, result) => {
      if (err) {
        throw err;
      }
      connection.release();
      return result;
    });
  })
}

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

  let sql = `INSERT INTO ${process.env.SQL_DB}.tutoring_requests SET ?`;
  db.pool.getConnection(function(err, connection){
    connection.query(sql, newRequest, (err, result) => {
      if (err) {
        return next(err);
      }
      connection.release();
      res.status(201).send();
    });
  })
};

const EditRequest = async (req, res, next) => {
  const { reqID } = req.params;
  const { user_id, time, date, subject_id, location, topics } = req.body;

  const sql = `UPDATE ${process.env.SQL_DB}.tutoring_requests SET Time="${time}", Date="${
    date.split("T")[0]
  }" WHERE Request_ID = ${reqID};`;

  try {
    await QueryDB.QueryDatabaseRow(sql, reqID);
  } catch (err) {
    next(err);
  }
  res.status(201).send();
};

const CheckOut = async(req, res, next) => {
  const { subject_id, quantity } = req.body; [{id: "", quantity: ""}]
  const { user_id, time, date, location, topics } = req.body;

  const sqlQuery = `SELECT Subject_ID, Subject_Name, Rate FROM ${process.env.SQL_DB}.subjects`;
  let SQLData;

  try {
    SQLData = await QueryDB.QueryColumn(sqlQuery);
  } catch (err) {
    return next(error);
  }
  const subject = SQLData[subject_id -1];
  try{
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data:{
          name: subject.Subject_Name
        },
        unit_amount: subject.Rate * 100
      },
      quantity: quantity
    }]
  , success_url: `${process.env.FRONT_END_URL}success`, cancel_url: `${process.env.FRONT_END_URL}requests`});
  //const result = await sendNewRequest(user_id, time, date, subject_id, location, topics);
  res.json({url: session.url, id: session.id}).send();
 
  } catch(error){
    next(error);
  }

};

exports.newRequest = newRequest;
exports.AvailableTimes = AvailableTimes;
exports.AvailableSubjects = AvailableSubjects;
exports.SearchUserRequests = SearchUserRequests;
exports.cancelRequest = cancelRequest;
exports.EditRequest = EditRequest;
exports.CheckOut = CheckOut;
