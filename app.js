const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const Request = require("./RequestSchema");
const HttpError = require("./http-error");
const userRoutes = require("./Routes/user-routes");
const requestRoutes = require("./Routes/request-routes");

const db = require("./util/connectMySQL");
//Create connection

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected...");
});

const app = express();

app.use(bodyParser.json());

/*app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); //opens up this domain to be access from other domains (CORS error)
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE"); //Which Http methods to be usedfrom the front end
  next();
});*/

app.use("/request/", requestRoutes);
app.use("/user/", userRoutes);

app.use((req, res, next) => {
  //this only runs if we didn't send a response in a previous route
  const error = new HttpError("Could not find this route.", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  //recognize this as an error handlding middleware function and will only be executed
  if (res.headerSent) {
    //check if a header has already been sent in other middleware function
    return next(error);
  } //where errors are thrown in other middleware functions
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error ocurred" });
});

app.listen("3000", () => {
  console.log("Hi, server 3000");
});
