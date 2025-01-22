const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontroller");

/* GET users listing. */
router.get("/", userController.users_get);

router.get("/:userId", userController.user_get);

router.delete("/:userId", userController.delete_user);

router.put("/:userId", (req, res) => {
  res.send("USER UPDATED");
});

router.get("/:userId/posts", userController.user_posts_get);

router.get("/:userId/comments", userController.user_comments_get);

module.exports = router;
