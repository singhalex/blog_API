const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

/*<-- USERS -->*/

// CREATE admin user
router.post("/", adminController.create_admin);

// GET all users
router.get("/users", adminController.users_get);

// DELETE user
router.delete("/users/:userId", adminController.users_delete);

/*<-- POSTS -->*/

// GET all posts
router.get("/posts", adminController.posts_get);

// POST create post
router.post("/posts", adminController.post_create);

//UPDATE post
router.put("/posts/:postId", adminController.post_update);

// DELETE post
router.delete("/posts/:postId", adminController.post_delete);

// GET unpublished posts
router.get("/posts/unpublished", adminController.posts_unpublished_get);

/*<-- Comments -->*/

module.exports = router;
