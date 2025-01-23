const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontroller");

// GET users list
router.get("/", userController.users_get);

// CREATE user
router.post("/", userController.user_create_post);

// GET single user
router.get("/:userId", userController.user_get);

// DELETE user
router.delete("/:userId", userController.delete_user);

// UPDATE user
router.put("/:userId", userController.update_user_put);

// GET all posts by user
router.get("/:userId/posts", userController.user_posts_get);

// GET all comments by user
router.get("/:userId/comments", userController.user_comments_get);

module.exports = router;
