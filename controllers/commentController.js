const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const passport = require("../utils/passport");
const { body, validationResult } = require("express-validator");
const containtsNonNumber = require("../utils/containsNonNumber");

// Get all comments
exports.comments_get = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      include: { author: { select: { name: true } } },
    });
    return res.json(comments);
  } catch (err) {
    next(err);
  }
};

// Get single comment
exports.single_comment_get = async (req, res, next) => {
  const { commentId } = req.params;

  if (containtsNonNumber(commentId)) {
    return res.status(400).json({ msg: "Invalid comment ID" });
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    return res.json(comment);
  } catch (err) {
    next(err);
  }
};

// Create comment
exports.create_comment_post = [
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitize user submission
  body("content")
    .trim()
    .escape()
    .isLength({ min: 1, max: 400 })
    .withMessage(""),

  async (req, res, next) => {
    const { postId } = req.params;
    const { errors } = validationResult(req);

    if (errors.length > 0) {
      return res.status(400).json({ msg: errors.map((error) => error.msg) });
    }

    try {
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId) },
        select: { id: true },
      });

      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }

      // Save post to db
      const comment = await prisma.comment.create({
        data: {
          authorId: req.user.id,
          postId: parseInt(postId),
          content: req.body.content,
        },
      });

      return res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },
];

exports.delete_comment_post = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { commentId } = req.params;

    if (containtsNonNumber(commentId)) {
      return res.status(400).json({ msg: "Invalid comment ID" });
    }

    try {
      // Check if comment exists
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId) },
      });

      if (!comment) {
        return res.status(404).json({ msg: "Comment not found" });
      }

      // Only author of comment can delete
      if (comment.authorId !== req.user.id) {
        return res
          .status(401)
          .json({ msg: "Can't delete other user's comments" });
      }

      // Delete from db
      const deletedComment = await prisma.comment.delete({
        where: { id: comment.id },
      });

      return res.json(deletedComment);
    } catch (err) {
      next(err);
    }
  },
];

exports.edit_comment_post = (req, res, next) => {
  res.send("COMMENT UPDATED");
};
