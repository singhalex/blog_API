const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const createJWT = require("../utils/createJWT");
const passport = require("passport");
const containsNonNumber = require("../utils/containsNonNumber");

const opts = { session: false, failWithError: true };

exports.create_admin = [
  // Validate user submission
  body("username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Username cannot be empty"),
  // Check if user already exists
  body("username").custom(async (value) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username: value },
      });
      if (user) {
        throw new Error("Username already exists");
      }
    } catch (err) {
      throw err;
    }
  }),
  body("password")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Password mnust be at least 4 characters long"),
  // Admin password is valid
  body("admin").custom((value) => {
    if (value !== process.env.ADMIN_PASSWORD) {
      throw new Error("Incorrect admin password");
    }
    return value;
  }),
  async (req, res, next) => {
    const { errors } = validationResult(req);
    const { username, password, name } = req.body;

    if (errors.length > 0) {
      return res.status(400).json({ msg: errors.map((error) => error.msg) });
    }

    // Encrypt password
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) return next(err);

      // Save author user to db
      try {
        const user = await prisma.user.create({
          data: { name, password: hashedPassword, username, role: "AUTHOR" },
        });

        return res.json({ jwt: createJWT(user) });
      } catch (err) {
        next(err);
      }
    });
  },
];

/*<-- USERS -->*/

exports.users_get = [
  // Authenticate user
  passport.authenticate("jwt", opts),
  // Check if user has rights to view users
  async (req, res, next) => {
    if (!req.user || req.user.role !== "AUTHOR") {
      return res
        .status(401)
        .json({ msg: "You are not authorized to view this data" });
    }

    if (req.user.role === "AUTHOR") {
      try {
        const users = await prisma.user.findMany({
          include: {
            _count: {
              select: {
                posts: true,
                comments: true,
              },
            },
          },
        });
        return res.json({ users });
      } catch (err) {
        next(err);
      }
    }
  },
];

exports.users_delete = [
  // Authenticate user
  passport.authenticate("jwt", opts),
  async (req, res, next) => {
    const user = req.user;
    const userId = req.params.userId;
    // Check for user rights
    if (!user || user.role !== "AUTHOR") {
      return res
        .status(401)
        .json({ msg: "You are not authorized to delete this user" });
    }
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Delete user from db
      const deletedUser = await prisma.user.delete({ where: { id: userId } });
      return res.json({ deletedUser });
    } catch (err) {
      next(err);
    }
  },
];

/*<-- POSTS -->*/

exports.posts_get = [
  // Authenticate user
  passport.authenticate("jwt", opts),

  async (req, res, next) => {
    const user = req.user;
    // Check if user has rights
    if (!user || user.role !== "AUTHOR") {
      return res
        .status(401)
        .json({ msg: "You do not have the rights to view these posts" });
    }

    try {
      // Return all posts
      const posts = await prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { comments: true } },
          author: { select: { name: true } },
        },
      });
      return res.json({ posts });
    } catch (err) {
      next(err);
    }
  },
];

exports.post_create = [
  passport.authenticate("jwt", opts),
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
  async (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== "AUTHOR") {
      return res
        .status(401)
        .json({ msg: "You do not have rights to create a post" });
    }

    const { title, content, published } = req.body;
    const { errors } = validationResult(req);

    // Check for errors
    if (errors.length > 0) {
      return res.status(400).json({ msg: errors.map((error) => error.msg) });
    }

    // Save post to db
    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          published,
          authorId: user.id,
        },
      });
      return res.status(201).json({ post });
    } catch (err) {
      next(err);
    }
  },
];

exports.post_delete = [
  passport.authenticate("jwt", opts),
  async (req, res, next) => {
    const user = req.user;
    const { postId } = req.params;

    if (!user || user.role !== "AUTHOR") {
      return res
        .status(401)
        .json({ msg: "You do not have rights to create a post" });
    }

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

      if (post.authorId !== user.id) {
        return res
          .status(401)
          .json({ msg: "Can't delete other author's post" });
      }

      // Delete post from db
      const deletedPost = await prisma.post.delete({
        where: { id: parseInt(postId) },
      });
      return res.json({ ...deletedPost, msg: "Post deleted" });
    } catch (err) {
      next(err);
    }
  },
];

exports.post_update = [
  passport.authenticate("jwt", opts),
  // Validate and sanitze user inputs
  body("title")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Title cannot be empty"),
  body("content").trim().escape(),
  body("published").customSanitizer((value) => {
    return value === "true" ? true : false;
  }),
  async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, published } = req.body;
    const { errors } = validationResult(req);
    const { user } = req;

    if (!user || user.role !== "AUTHOR") {
      return res
        .status(401)
        .json({ msg: "You do not have rights to create a post" });
    }

    if (errors.length > 0) {
      return res.status(400).json({ msg: errors.map((error) => error.msg) });
    }

    if (containsNonNumber(postId)) {
      return res.status(400).json({ msg: "Invalid post ID" });
    }

    try {
      // Lookup post in db
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId) },
      });

      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }

      if (post.authorId !== user.id) {
        return res
          .status(401)
          .json({ msg: "You cannot edit other author's posts" });
      }

      const updatedPost = await prisma.post.update({
        where: { id: post.id },
        data: { title, content, published },
      });

      return res.json({ ...updatedPost, msg: "Post updated" });
    } catch (err) {
      next(err);
    }
  },
];
/*<-- COMMENTS -->*/
