const express = require("express");
const router = express.Router();
const connectdb = require("./../dbconnect");
const User = require("./../models/User");
const bodyParser = require("body-parser");

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

// router.route("/").post((req, res, next) => {
  router.post("/",urlencodedParser, function(req, res,next) {
  console.log(req);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  connectdb.then(db => {
    User.find({
      $and: [{
        username: req.body.username
      }, {
        password: req.body.password
      }]
    }).then(chat => {
      if (chat.length) {
        return res.json(1)
      } else {
        return res.json(0)
      }
    });
  });
});


module.exports = router;