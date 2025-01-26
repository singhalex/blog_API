const jwt = require("jsonwebtoken");
const createJWT = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
};

module.exports = createJWT;
