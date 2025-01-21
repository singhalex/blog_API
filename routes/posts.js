const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.get("/", postController.posts_get);

router.get("/:postId", postController.single_post_get);

router.get("/:postId/comments", (req, res, next) => {
  res.send("THESE ARE THE COMMENTS FOR A POST");
});

router.post("/:postId/comments", (req, res) => {
  res.send("ADD A COMMENT TO A POST");
});

router.post("/", postController.create_post_post);

router.put("/:postId", postController.update_post_post);

router.delete("/:postId", postController.delete_post_post);

module.exports = router;
