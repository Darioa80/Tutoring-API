const HttpError = require("../http-error");
const dbModule = require("../util/connectMySQL");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const QueryDB = require("../util/QueryDatabase");

const AddUser = (userObject) => {
  let addSQLQuery = `INSERT INTO ${process.env.SQL_DB}.users SET ?`;
  return new Promise((resolve, reject) => {
    dbModule.db.query(addSQLQuery, userObject, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const CheckForUser = async (email) => {
  let userSearchQuery = `SELECT * FROM ${process.env.SQL_DB}.users WHERE Email = ?`;

  let user = await QueryDB.QueryDatabaseRow(userSearchQuery, email);

  return user;
};

const CreateToken = (userID, email) => {
  let token;
  try {
    token = jwt.sign({ userID, email }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });
  } catch (err) {
    const error = new HttpError(
      "Failed to sign up, please try again later.",
      500
    );
    return next(error);
  }
  return token;
};

const Login = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  let checkPassword;

  try {
    user = await CheckForUser(email);
  } catch (err) {
    next(err);
  }
  if (user.length == 0) {
    const error = new HttpError("User doesn't exist, please sign up", 422);
    return next(error);
  }

  try {
    checkPassword = await bcrypt.compare(password, user[0].Password);
  } catch (err) {
    const error = new HttpError("Something went wrong, try again later", 422);
    return next(error);
  }
  if (checkPassword) {
    let token = CreateToken(user[0].User_ID, email);

    res.status(201).json({
      userID: user[0].User_ID,
      firstName: user[0].First_Name,
      email: user[0].Email,
      token,
    });
  } else {
    const error = new HttpError("Incorrect Password, please try again", 403);
    return next(error);
  }
};

const Register = async (req, res, next) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;
  let user;
  let hashedPasword;

  user = await CheckForUser(email);

  if (user.length > 0) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }

  try {
    hashedPasword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "could not create user, please try again.",
      500
    );
    return next(error);
  }

  const newUserInfo = {
    First_Name: firstName,
    Last_Name: lastName,
    Email: email,
    Phone_Number: phoneNumber,
    Password: hashedPasword,
  };

  let insertResult;

  try {
    insertResult = await AddUser(newUserInfo);
  } catch (err) {
    if (err) {
      const error = new HttpError("A problem occurred, try again later", 500);
      return next(error);
    }
  }

  let token = CreateToken(insertResult.insertId, email);

  res
    .status(201)
    .json({ userID: insertResult.insertId, firstName, email, token });
};

exports.Register = Register;
exports.Login = Login;
