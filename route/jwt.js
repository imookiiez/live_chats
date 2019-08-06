const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
var publicKEY = fs.readFileSync(path.join(__dirname + "/public.key"), "utf8");
var privateKEY = fs.readFileSync(path.join(__dirname + "/private.key"), "utf8");

var i = "Terrabit"; // Issuer (Software organization who issues the token)
var s = "Live-chat"; // Subject (intended user of the token)
var a = ""; // Audience (Domain within which this token will live and function)

module.exports = {
  sign: payload => {
    // Token signing options
    var signOptions = {
      issuer: i,
      subject: s,
      audience: a,
      expiresIn: "1 hour", // 1 hour validity  minute
      algorithm: "RS256"
    };
    return jwt.sign(payload, privateKEY, signOptions);
  },
  verify: (req, res, next) => {
    //next();
    var token = req.headers["x-access-token"];
    if (!token)
      return res
        .status(403)
        .send({ auth: false, message: "No token provided." });

    var verifyOptions = {
      issuer: i,
      subject: s,
      audience: a,
      expiresIn: "1 hour",
      algorithm: ["RS256"]
    };
    // console.log(token);
    jwt.verify(token, publicKEY, verifyOptions, function(err, decoded) {
    // console.log(decoded);
      if (err)
        return res
          .status(403)
          .send({ auth: false, message: "Failed to authenticate token." });
      // if everything good, save to request for use in other routes
      req.username = decoded.username;
      req.position = decoded.position;
      req.team = decoded.team;
      next();
    });
  }
};
