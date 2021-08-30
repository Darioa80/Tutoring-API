const express = require("express");
const CheckAuth = require("../Middleware/check-auth");
//const requestController = require("../Controllers/request-controller");
const subjectsController = require("../Controllers/subjects-controller");
//router.use(CheckAuth);

const router = express.Router();
router.get("/subjects", subjectsController.getAllSubjects);

module.exports = router;
