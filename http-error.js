class HttpError extends Error {
  //inherits Error class
  constructor(message, errorCode) {
    super(message); //adds a message property to the Error class
    this.code = errorCode;
  }
}

module.exports = HttpError;
