const express = require("express");
const CheckAuth = require("../Middleware/check-auth");
const requestController = require("../Controllers/request-controller");

const router = express.Router();

//router.use(CheckAuth);

router.post("/times", requestController.AvailableTimes);
router.get("/subjects", requestController.AvailableSubjects);
router.get("/user/:userID", requestController.SearchUserRequests);
router.get("/user/:reqID", requestController.cancelRequest);

router.post("/", requestController.newRequest);

module.exports = router;
