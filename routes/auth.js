const express = require("express");
const router = express.Router();

const authController = require("../controllers/authcontroller.js");

// Log in
router.post("/", authController.login_post);

module.exports = router;
