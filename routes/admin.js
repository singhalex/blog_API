const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// CREATE admin user
router.post("/", adminController.create_admin);

// GET all users
router.get("/users", adminController.users_get);

// DELETE user
router.delete("/:userId", (req, res) => {
  res.send("USER DELETED");
});

module.exports = router;
