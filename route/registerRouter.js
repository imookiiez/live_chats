const express = require("express");
const router = express.Router();
const connectdb = require("./../dbconnect");
const User = require("./../models/User");

router.route("/").post((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  connectdb.then(db => {
    User.find({
      username: req.body.username
    }).then(username => {
      if (username.length) {
        res.end("user found")
      } else {
        connectdb.then(db => {
          let dataUser = new User({
            username: req.body.username,
            password: req.body.password
          });
          dataUser.save(function (err) {
            if (err) return res.end("user error")
            return res.end("user save")
          });

        });
      }
    });
  })

});

module.exports = router;