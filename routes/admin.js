const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// CREATE admin user
router.post("/", adminController.create_admin);

// GET all users
router.get("/users", adminController.users_get);

// DELETE user
router.delete("users/:userId", (req, res) => {
  res.send("USER DELETED");
});

// GET all posts
router.get("/posts", (req, res, next) => {
  res.send("ALL POSTS");
});

// GET unpublished posts
router.get("/posts", (req, res) => {
  res.send("UNPUBLISHED POSTS");
});

// POST post
router.post("/posts", (req, res) => {
  res.send("POST PUBLISHED");
});

//UPDATE post
router.put("/posts/:postId", (req, res) => {
  res.send("POST UPDATED");
});

// DELETE post
router.delete("/posts/:postId", (req, res) => {
  res.send("POST DELETED");
});

module.exports = router;
