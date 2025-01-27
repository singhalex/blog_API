const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// CREATE admin user
router.post("/", adminController.create_admin);

// DELETE user
router.delete("/:userId", (req, res) => {
  res.send("USER DELETED");
});

module.exports = router;
