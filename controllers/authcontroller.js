const passport = require("../utils/passport");
const jwt = require("jsonwebtoken");

const createJWT = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
};

exports.login_post = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json(info);
    }
    return res.json(createJWT(user));
  })(req, res, next);
};
