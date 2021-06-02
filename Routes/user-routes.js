const express = require("express");
const userController = require("../Controllers/user-controller");

const router = express.Router();

router.get("/appointments", userController.SearchUserAppointments);
router.post("/register", userController.Register);
router.post("/login", userController.Login);

module.exports = router;
