const HttpError = require("../http-error");
const dbModule = require("../util/connectMySQL");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../util/connectMySQL");
const stripe = require("../util/stripe");
const QueryDB = require("../util/QueryDatabase");
const { sendConfirmationMail  } = require("../util/mail");

const AddUser = (userObject) => {
  let addSQLQuery = `INSERT INTO ${process.env.SQL_DB}.users SET ?`;
  return new Promise((resolve, reject) => {
    db.pool.getConnection(function(err,connection){
      connection.query(addSQLQuery, userObject, (err, result) => {
        if (err) {

          connection.release();
          return reject(err);
        }
        connection.release();
        return resolve(result);
      });
    });
  });
};

const CheckForUser = async (email) => {
  let userSearchQuery = `SELECT * FROM ${process.env.SQL_DB}.users WHERE Email = ?`;
  try{
    let user = await QueryDB.QueryDatabaseRow(userSearchQuery, email);
    return user;
} catch(err){
    return next(err);
  }

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
    throw error;
  }
  return token;
};

const createAdmin = async (req, res, next) =>{
  const {email} = req.body;
  console.log(email);
  //Should check if the user sendign the request has an admin role
  user = await CheckForUser(email);
  console.log(user[0])
  if (user.length == 0) {
    const error = new HttpError("User doesn't exist, please sign up", 422);
    return next(error);
  }
  try{
    await QueryDB.UpdateColumn('users', 'admin', 'admin', 'User_ID', user[0].User_ID);
  }
  catch(err){
    return next(err);
  }
 res.status(201).send();
}

const Login = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  let checkPassword;

  try {
    user = await CheckForUser(email);
    if (user.length == 0) {
      const error = new HttpError("User doesn't exist, please sign up", 422);
      return next(error);
    }
  } catch (err) {
    next(err);
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
      admin: user[0].admin
    });
  } else {
    const error = new HttpError("Incorrect Password, please try again", 403);
    return next(error);
  }
};

const CreateStripeId = async (email, name) => {
 const customer = await stripe.customers.create({email, name});
 console.log(customer.id);
  return customer.id;
}

const Register = async (req, res, next) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;
  let user;
  let hashedPasword;
  let name = `${firstName} ${lastName}`;
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
  newUserStripeId = await CreateStripeId(email, name);
  const newUserInfo = {
    First_Name: firstName,
    Last_Name: lastName,
    Email: email,
    Phone_Number: phoneNumber,
    Password: hashedPasword,
    Stripe_ID: newUserStripeId
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

  let token = CreateToken(Math.floor(Math.random() * 100), email);
  let error = await storeConfirmationToken(token, insertResult.insertId);
  if(error.code != 0){
    return next(error);
  }
  const link = `${process.env.FRONT_END_URL}/confirmation/${token}`
  //send email
  //sendConfirmationMail(email, link);
  sendConfirmationMail(email, link);
  console.log(link);
  res
    .status(201)
    .json({ userID: insertResult.insertId, firstName, email, token });
};

const testEmail = async (req, res, next) =>{
  const {body} = req;
  console.log(body);
  let sql = `SELECT Confirmation_Token from ${process.env.SQL_DB}.users WHERE Email = ?`;
  token = await QueryDB.QueryDatabaseRow(sql, body.email );

  console.log(token[0].Confirmation_Token);
  const link = `${process.env.FRONT_END_URL}confirmation/${token[0].Confirmation_Token}`;
  sendConfirmationMail(body.email, link);




}

const storeConfirmationToken = async (token, userID) => {
  console.log(`Registering new user ${userID}: `, token);
  let error = new HttpError("", 0);
  try{

    await QueryDB.UpdateColumn("users", "Confirmation_Token", token, "User_ID", userID);
  } catch(e){
    error = new HttpError(
      "could not create user, please try again.",
      500
    );
    
  }
  console.log(error);
  return error;
  
}

const AuthenticateAccount = async (req, res, next) => {
  const { token } = req.params;
  console.log(token);
  try{
    QueryDB.UpdateColumn(`${process.env.SQL_DB}.users`, "Confirmation", 1, "Confirmation_Token", token );

  }catch(e){
    error = new HttpError(
      "could not authenticate account, please try again later.",
      500
    );
    next(error);
  }
  

}


exports.Register = Register;
exports.AuthenticateAccount = AuthenticateAccount;
exports.Login = Login;
exports.createAdmin = createAdmin;
exports.testEmail = testEmail;
