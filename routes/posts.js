const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.get("/", postController.posts_get);

router.get("/:postId", postController.single_post_get);

router.post("/create", postController.create_post_post);

router.post("/:postId/update", postController.update_post_post);

router.post("/:postId/delete", postController.delete_post_post);

module.exports = router;
