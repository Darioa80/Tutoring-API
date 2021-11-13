const jwt = require("jsonwebtoken");
const HttpError = require("../http-error");

const CheckAuth = (req, res, next) => {
  console.log("in there doug");
  if (req.method === "OPTIONS") {
    //adjustment to enseure options requests (sent by the browser) are not blocked
    return next();
  }
  try {
    console.log(req.headers);
    const token = req.headers.authorization.split(" ")[1]; //look at app.js for expected headers => Authorization: 'Bearer TOKEN'
    console.log(token);
    console.log(!token);
    if (!token) {
      throw new Error("Authentication failed!");
    }
    //const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    console.log(decodedToken);
    req.userData = { userID: decodedToken.userID }; //can always add data to request object

    next();
  } catch (err) {
    const error = new HttpError("Autnentication failed!", 403);
    return next(error);
  }
};

exports.CheckAuth = CheckAuth;
