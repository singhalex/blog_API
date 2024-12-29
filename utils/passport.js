const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcryptjs");

// Define local strategy
passport.use(
  new LocalStrategy({ session: false }, async (username, password, done) => {
    // Search db for user
    try {
      const user = await prisma.user.findUnique({
        where: { username: username },
      });

      // Return user only if found
      if (!user) {
        return done(null, false, { msg: "Username not found" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { msg: "Incorrect password" });
      }

      return done(null, user, { msg: "Logged in successfully" });
    } catch (err) {
      return done(err);
    }
  })
);

module.exports = passport;
