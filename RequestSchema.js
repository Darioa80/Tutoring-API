class Request {
  //for a guest user
  /*constructor(
    userID = null,
    firstName,
    lastName,
    email,
    phoneNumber,
    time,
    date,
    subject_ID,
    location = "virtual",
    topics = null
  ) {
    this.User_ID = userID;
    this.First_Name = firstName;
    this.Last_Name = lastName;
    this.Email = email;
    this.Phone_Number = phoneNumber;
    this.Time = time;
    this.Date = date;
    this.Subject_ID = subject_ID;
    this.Location = location;
    this.Topics = topics;
  }*/

  constructor(
    userID,
    time, //existing user
    date,
    subject_ID,
    location = "virtual",
    topics = null
  ) {
    this.User_ID = userID;
    this.Time = time;
    this.Date = date;
    this.Subject_ID = subject_ID;
    this.Location = location;
    this.Topics = topics;
  }
}
module.exports = Request;
