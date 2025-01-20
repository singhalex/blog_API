const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const passport = require("../utils/passport");

// Get all comments
exports.comments_get = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany();
    return res.json(comments);
  } catch (err) {
    next(err);
  }
};

exports.single_comment_get = (req, res, next) => {
  res.send("SINGLE COMMENT");
};

exports.create_comment_post = (req, res, next) => {
  res.send("COMMENT CREATED");
};

exports.delete_comment_post = (req, res, next) => {
  res.send("COMMENT DELETED");
};

exports.edit_comment_post = (req, res, next) => {
  res.send("COMMENT UPDATED");
};
