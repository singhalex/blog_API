const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const passport = require("../utils/passport");
const { body, validationResult } = require("express-validator");

const containsNonNumber = (string) => {
  return /[^0-9]/.test(string);
};

// Send all published posts
exports.posts_get = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      where: { published: true },
      include: {
        _count: {
          select: { comments: true },
        },
        author: {
          select: { name: true },
        },
      },
    });
    return res.json(posts);
  } catch (err) {
    return next(err);
  }
};

// Send single post with author and comment details
exports.single_post_get = async (req, res, next) => {
  const { postId } = req.params;

  if (containsNonNumber(postId)) {
    return res.status(400).json({ msg: "Invalid post ID" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
      include: {
        author: { select: { name: true } },
        comments: { include: { author: { select: { name: true } } } },
      },
    });
    if (post) {
      return res.json(post);
    } else {
      return res.status(404).json({ msg: "Post not found" });
    }
  } catch (err) {
    return next(err);
  }
};

// Create new post
exports.create_post_post = [
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitize user submission
  body("title")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Title cannot be empty"),
  body("content").trim().escape(),
  body("published").customSanitizer((value) => {
    return value === "true" ? true : false;
  }),

  // Save submission to db
  async (req, res, next) => {
    const { published, title, content } = req.body;
    const { errors } = validationResult(req);

    if (errors.length > 0) {
      return res.status(400).json({ msg: errors.map((error) => error.msg) });
    }

    // Only authors can post
    if (req.user.role === "AUTHOR") {
      try {
        const post = await prisma.post.create({
          data: {
            published,
            title,
            content,
            authorId: req.user.id,
          },
        });
        return res.satus(201).json(post);
      } catch (err) {
        next(err);
      }
    }
    return res.status(401).json({ msg: "You do not have publishing rights" });
  },
];

exports.update_post_post = [
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  // Validate and sanitze user inputs
  body("title")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Title cannot be empty"),
  // Validate and sanitize user input
  body("content").trim().escape(),
  body("published").customSanitizer((value) => {
    return value === "true" ? true : false;
  }),
  async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, published } = req.body;
    const { errors } = validationResult(req);

    if (errors.length > 0) {
      return res.status(400).json({ msg: errors.map((error) => error.msg) });
    }

    if (containsNonNumber(postId)) {
      return res.status(400).json({ msg: "Invalid post ID" });
    }

    try {
      // Lookup post in db
      const { authorId } = await prisma.post.findUnique({
        where: { id: parseInt(postId) },
      });

      // Only update if authors match
      if (authorId === req.user.id) {
        const updatedPost = await prisma.post.update({
          where: { id: parseInt(postId) },
          data: { title, content, published },
        });

        // Return if post not found
        if (!updatedPost) {
          return res.status(404).json({ msg: "Post not found" });
        }
        return res.json(updatedPost);
      } else {
        return res
          .status(401)
          .json({ msg: "Can't delete other author's posts" });
      }
    } catch (err) {
      next(err);
    }
  },
];

exports.delete_post_post = [
  // Authenticate user
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { postId } = req.params;

    if (containsNonNumber(postId)) {
      return res.status(404).json({ msg: "Invalid post ID" });
    }

    try {
      // Retrieve post
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId) },
      });

      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }

      // Delete post if authored by user
      if (post.authorId === req.user.id) {
        const deletedPost = await prisma.post.delete({
          where: { id: parseInt(postId) },
        });

        return res.json({ deletedPost, msg: "Post deleted" });
      } else {
        return res
          .status(401)
          .json({ msg: "Can't delete other author's post" });
      }
    } catch (err) {
      next(err);
    }
  },
];
