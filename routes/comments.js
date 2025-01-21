const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.get("/", commentController.comments_get);

router.get("/:commentId", commentController.single_comment_get);

router.post("/create/:postId", commentController.create_comment_post);

router.post("/:commentId/delete", commentController.delete_comment_post);

router.post("/:commentId/edit", commentController.edit_comment_post);

module.exports = router;
