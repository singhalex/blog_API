const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const createJWT = require("../utils/createJWT");

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
