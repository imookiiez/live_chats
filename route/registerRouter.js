const express = require("express");
const router = express.Router();
const connectdb = require("./../dbconnect");
const User = require("./../models/User");
const bodyParser = require("body-parser");

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

router.post("/", urlencodedParser, function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  connectdb.then(db => {
    User.find({
      username: req.body.username
    }).then(username => {
      if (username.length) {
        return res.json("user found")
      } else {
        connectdb.then(db => {
          let dataUser = new User({
            username: req.body.username,
            password: req.body.password,
            position: req.body.position,
            team: req.body.team,
          });
          dataUser.save(function (err) {
            if (err) return res.json("user error")
            return res.json("user save")
          });

        });
      }
    });
  })

});

module.exports = router;