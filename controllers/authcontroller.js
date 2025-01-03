const passport = require("../utils/passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.login_post = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      console.log(info.msg);
      return res.status(401).json(user);
    }

    const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
    return res.json(token);
  })(req, res, next);
};

exports.signup_post = (req, res, next) => {
  const { username, password, name } = req.body;

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) return next(err);

    try {
      const user = await prisma.user.create({
        data: { username, password: hashedPassword, name },
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  });
};
