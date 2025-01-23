const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const prisma = new PrismaClient({ omit: { user: { password: true } } });
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const createJWT = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
};

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

// Return all users
exports.users_get = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "You must be logged in to view users" });
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
      return res.json(users);
    } catch (err) {
      next(err);
    }
  }

  return res.status(402).json({
    msg: "You are not authorized to view users",
  });
};

// Get own user info
exports.user_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (isAuthorized) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { posts: { select: { id: true, title: true } } },
      });
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }

  return;
};

// Create user
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
        console.log(user);
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

    // Encryp password
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) return next(err);

      // Save user to db
      try {
        const user = await prisma.user.create({
          data: { username, password: hashedPassword, name },
        });
        return res.json(createJWT(user));
      } catch (err) {
        next(err);
      }
    });
  },
];

// Delete user
exports.delete_user = [
  passport.authenticate("jwt", { session: false }),

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

        return res.json(deletedUser);
      } catch (err) {
        next(err);
      }
    }
    return res
      .status(401)
      .json({ msg: "You are not authorized to delete this user" });
  },
];

// Get all posts of a user
exports.user_posts_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (isAuthorized) {
    try {
      const posts = await prisma.post.findMany({
        where: { authorId: req.user.id },
      });
      return res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  return;
};

// Get all comments of a user
exports.user_comments_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (isAuthorized) {
    try {
      const comments = await prisma.comment.findMany({
        where: { authorId: req.user.id },
      });
      return res.json(comments);
    } catch (err) {
      next(err);
    }
  }
};
