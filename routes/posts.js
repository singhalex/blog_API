const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.get("/", postController.posts_get);

router.get("/:postId", postController.single_post_get);

router.post("/", postController.create_post_post);

router.put("/:postId", postController.update_post_post);

router.delete("/:postId", postController.delete_post_post);

router.get("/:postId/comments", postController.comments_on_post_get);

router.post("/:postId/comments", postController.create_comment_on_post);

module.exports = router;
