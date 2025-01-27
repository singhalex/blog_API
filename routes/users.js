const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontroller");
const passport = require("passport");

const opts = {
  session: false,
  failWithError: true,
};

// GET users list
router.get("/", passport.authenticate("jwt", opts), userController.users_get);

// CREATE user
router.post("/", userController.user_create_post);

// GET single user
router.get(
  "/:userId",
  passport.authenticate("jwt", opts),
  userController.user_get
);

// DELETE user
router.delete(
  "/:userId",
  passport.authenticate("jwt", opts),
  userController.delete_user
);

// UPDATE user
router.put(
  "/:userId",
  passport.authenticate("jwt", opts),
  userController.update_user_put
);

// GET all posts by user
router.get(
  "/:userId/posts",
  passport.authenticate("jwt", opts),
  userController.user_posts_get
);

// GET all comments by user
router.get(
  "/:userId/comments",
  passport.authenticate("jwt", opts),
  userController.user_comments_get
);

module.exports = router;
