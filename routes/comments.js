const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.get("/", commentController.comments_get);

router.get("/:commentId", commentController.single_comment_get);

router.delete("/:commentId", commentController.delete_comment_post);

router.put("/:commentId", commentController.edit_comment_post);

module.exports = router;
