const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// CREATE admin user
router.post("/", adminController.create_admin_post);

module.exports = router;
