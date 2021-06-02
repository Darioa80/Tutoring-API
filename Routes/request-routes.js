const express = require("express");
const CheckAuth = require("../Middleware/check-auth");
const requestController = require("../Controllers/request-controller");

const router = express.Router();

//router.use(CheckAuth);

router.get("/", requestController.AvailableTimes);

router.post("/", requestController.newRequest);

module.exports = router;
