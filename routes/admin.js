const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// CREATE admin user
router.post("/", adminController.create_admin);

// GET all users
router.get("/users", adminController.users_get);

// DELETE user
router.delete("/users/:userId", adminController.users_delete);

// GET all posts
router.get("/posts", adminController.posts_get);

// POST create post
router.post("/posts", adminController.posts_create);

//UPDATE post
router.put("/posts/:postId", (req, res) => {
  res.send("POST UPDATED");
});

// DELETE post
router.delete("/posts/:postId", (req, res) => {
  res.send("POST DELETED");
});

// GET unpublished posts
router.get("/posts/unpublished", (req, res) => {
  res.send("UNPUBLISHED POSTS");
});

module.exports = router;
