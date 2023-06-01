const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token)
    return res.status(401).send("access denied, not autheneticated....");
  try {
    keys.secretOrKey;
    const user = jwt.verify(token, secretOrKey);

    req.user = user;

    next();
  } catch (ex) {
    return res.status(400).send("access denied, invalid token....");
  }
};

const isAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).send("access denied, not authorized....");
    }
  });
};
module.exports = { auth, isAdmin };
