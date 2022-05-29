const HttpError = require("../http-error");
const Request = require("../RequestSchema");
const dbModule = require("../util/connectMySQL");
const stripe = require("../util/stripe");
const moment = require("moment");
const db = require("../util/connectMySQL");


const QueryDB = require("../util/QueryDatabase");
const { makeCalendarEvent } = require("../util/google-calendar");

const SearchUserRequests = async (req, res, next) => {
  //needs to be authorized and checked that the userID matches the logged in user
  const { userID } = req.params;
  const sqlQuery =
    `SELECT Subject_ID, Time, Date, Location FROM ${process.env.SQL_DB}.tutoring_requests WHERE User_ID = ? AND Canceled = null`;
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
    console.log(appointments);
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
  let sql = `UPDATE ${process.env.SQL_DB}.tutoring_requests SET Canceled = '${new Date().toISOString().slice(0, 10)}' WHERE Request_ID = ?`;
  console.log(sql);
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
  const { subject_id, quantity } = req.body; 
  const { user_id, time, date, location, topics, email } = req.body;
  const sqlQuery = `SELECT Subject_ID, Subject_Name, Rate FROM ${process.env.SQL_DB}.subjects`;
  let SQLData;

  try {
    SQLData = await QueryDB.QueryColumn(sqlQuery);
  } catch (err) {
    return next(error);
  }
  const subject = SQLData[subject_id -1];
  makeCalendarEvent( date, time, location, subject.Subject_Name, email);
  try{
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    metadata: { user_id, time, date, location, topics, subject_name: subject.Subject_Name, email },
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

const getUsersAndRequest = async(req, res, next) => {
  const sql = `Select * from ${process.env.SQL_DB}.users where User_ID = ?`
  const user = await QueryDB.QueryDatabaseRow(sql, req.userData.userID);
  if(user[0].admin !== 'admin'){
    return new Error("Not Authorized");
  }
  else{
    try{
      const data = await QueryDB.UsersAndRequests();
       res.send(data);
    } catch(error){
      console.log("error");
      next(error)
    }


  }

}

const handleWebhook = async(req,res,next) => {
  const signature = req.headers['stripe-signature'];
  const endPointSecret = process.env.STRIPE_WB_HOOK;

  const subjectMap = {
    1:	"Algebra",
2:	"Geometry",
3:	"College Algebra",
4:	"Pre-Calc",
5:	"Calculus I",
6:	"Calculus II",
7:	"Physics I - Mechanics",
8:	"Statics",
9:	"Physics II - Electricity and Magnetism",
10:	"Trigonometry"
  };
 
  let event;
  try{
    event = stripe.webhooks.constructEvent(req.rawBody, signature, endPointSecret);

  }
  catch(err){
    let error = new HttpError(`Couldn't authenticate event`)

  }

  switch(event.type){
    case 'checkout.session.completed':
    console.log(req.body.data.object);
    console.log(req.body.data.object.metadata);
    if(req.body.data.object.metadata !== null){
      const reqInfo = req.body.data.object.metadata;
      await sendNewRequest(reqInfo.user_id, reqInfo.time, reqInfo.date, reqInfo.subject_id, reqInfo.location, reqInfo.topics );
    }
    //Time: 13:00:00
    //Date: 2022-03-20

    makeCalendarEvent(reqInfo.date, reqInfo.time, reqInfo.location, subjectMap[reqInfo.subject_id], reqInfo.email );


    //Make Google Calendar event
    //How do I get request data here? Meta data from session

  }

}


exports.newRequest = newRequest;
exports.AvailableTimes = AvailableTimes;
exports.AvailableSubjects = AvailableSubjects;
exports.SearchUserRequests = SearchUserRequests;
exports.cancelRequest = cancelRequest;
exports.EditRequest = EditRequest;
exports.CheckOut = CheckOut;
exports.getUsersAndRequest = getUsersAndRequest;
exports.handleWebhook = handleWebhook
