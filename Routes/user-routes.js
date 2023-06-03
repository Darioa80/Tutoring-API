const express = require("express");
const CheckAuth = require("../Middleware/check-auth");

const userController = require("../Controllers/user-controller");

const router = express.Router();

router.post("/register", userController.Register);
router.get("/register/:token", userController.AuthenticateAccount)
router.post("/login", userController.Login);
router.post("/test",userController.testEmail );


router.use(CheckAuth.CheckAuth);

router.post("/admin", userController.createAdmin);

module.exports = router;
