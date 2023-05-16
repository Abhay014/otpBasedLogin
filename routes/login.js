// requirements
const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login");

//post route for generating otp
router.post('/generateOtp',loginController.genrateOtp)

// post route for verifying otp
router.post("/verify",loginController.login);


module.exports = router;

