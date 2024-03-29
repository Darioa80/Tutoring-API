const express = require("express");
const CheckAuth = require("../Middleware/check-auth");
const requestController = require("../Controllers/request-controller");

const router = express.Router();

//router.use(CheckAuth);

router.post("/times", requestController.AvailableTimes);
router.get("/subjects", requestController.AvailableSubjects);

//authenticated routes
router.use(CheckAuth.CheckAuth);

router.post("/", requestController.newRequest);
router.get("/user/:userID", requestController.SearchUserRequests);
router.delete("/:reqID", requestController.cancelRequest);
router.patch("/:reqID", requestController.EditRequest);
router.post("/create-checkout-session", requestController.CheckOut)

module.exports = router;
