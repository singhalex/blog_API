const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const prisma = new PrismaClient({ omit: { user: { password: true } } });
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const createJWT = require("../utils/createJWT");

const checkAuth = (userId, params, res) => {
  if (!userId) {
    res.status(401).json({ msg: "You must be logged in to view user info" });
    return false;
  }

  if (userId !== params) {
    res
      .status(401)
      .json({ msg: "You are not authorized to view this user data" });
    return false;
  }

  return true;
};

// CREATE user
exports.user_create_post = [
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

  (req, res, next) => {
    const { username, password, name } = req.body;
    const { errors } = validationResult(req);

    // Return messages if submission has errors
    if (errors.length > 0) {
      return res.json({ msg: errors.map((error) => error.msg) });
    }

    // Encrypt password
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) return next(err);

      // Save user to db
      try {
        const user = await prisma.user.create({
          data: { username, password: hashedPassword, name },
        });
        return res.json({ jwt: createJWT(user) });
      } catch (err) {
        next(err);
      }
    });
  },
];

// GET own user info
exports.user_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (!isAuthorized) {
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { posts: { select: { id: true, title: true } } },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE user
exports.delete_user = [
  async (req, res, next) => {
    const { userId } = req.params;
    if (req.user.role === "AUTHOR" || req.user.id === req.params.userId) {
      try {
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return res.status(404).json({ msg: "User not found" });
        }

        const deletedUser = await prisma.user.delete({
          where: { id: userId },
        });

        return res.json({ ...deletedUser, msg: "User deleted" });
      } catch (err) {
        next(err);
      }
    }

    return res
      .status(401)
      .json({ msg: "You are not authorized to delete this user" });
  },
];

// UPDATE user
exports.update_user_put = [
  // Check if user can change data
  (req, res, next) => {
    const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
    if (isAuthorized) {
      next();
    }

    return;
  },
  body("username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Username cannot be empty"),
  // Check if user already exists
  body("username").custom(async (value, { req }) => {
    // Return if username unchanged
    if (value == req.user.username) {
      return;
    }

    // Check if new username already in use
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
  async (req, res, next) => {
    const { errors } = validationResult(req);
    const { username, name, password } = req.body;

    if (errors.length > 0) {
      return res.status(400).json({ msg: errors.map((error) => error.msg) });
    }

    // Update user in db
    try {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          username,
          password,
          name,
        },
      });

      return res.json({ ...updatedUser, msg: "User info updated" });
    } catch (err) {
      next(err);
    }
  },
];

// GET all posts of a user
exports.user_posts_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (isAuthorized) {
    try {
      const posts = await prisma.post.findMany({
        where: { authorId: req.user.id },
      });
      return res.json({ posts });
    } catch (err) {
      next(err);
    }
  }

  return;
};

// GET all comments of a user
exports.user_comments_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (isAuthorized) {
    try {
      const comments = await prisma.comment.findMany({
        where: { authorId: req.user.id },
      });
      return res.json({ comments });
    } catch (err) {
      next(err);
    }
  }
};
