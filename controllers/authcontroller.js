const passport = require("../utils/passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createJWT = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
};

exports.login_post = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      console.log(info.msg);
      return res.status(401).json(user);
    }
    return res.json(createJWT(user));
  })(req, res, next);
};

exports.signup_post = [
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
    } catch {
      throw new Error("Database error. Try again");
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
