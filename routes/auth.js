const express = require("express");
const router = express.Router();

const authController = require("../controllers/authcontroller.js");

// TO-DO
router.post("/log-in", authController.login_post);

// TO-DO
router.post("/sign-up", authController.signup_post);

module.exports = router;
