const passport = require("../utils/passport");
const createJWT = require("../utils/createJWT");

exports.login_post = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json(info);
    }
    return res.json({ jst: createJWT(user) });
  })(req, res, next);
};
