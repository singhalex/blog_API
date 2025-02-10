const express = require("express");
const router = express.Router();

const authController = require("../controllers/authcontroller.js");

// GET user from jwt
router.get("/", authController.check_jwt);

// Log in
router.post("/", authController.login_post);

module.exports = router;
