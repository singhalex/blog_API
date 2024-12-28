const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Define local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    // Search db for user
    try {
      const user = await prisma.user.findUnique({
        where: { username: username },
      });

      // Return user only if found
      if (!user) {
        return done(null, false, { msg: "Username not found" });
      }

      if (user.password !== password) {
        return done(null, false, { msg: "Incorrect password" });
      }

      return done(null, user, { msg: "Logged in successfully" });
    } catch (err) {
      return done(err);
    }
  })
);

module.exports = passport;
