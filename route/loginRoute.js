const express = require("express");
const router = express.Router();
const connectdb = require("./../dbconnect");
const User = require("./../models/User");
const jwt = require("./jwt");
const bodyParser = require("body-parser");

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

router.post("/",urlencodedParser, function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  connectdb.then(db => {
    User.find({
        username: req.body.username
      // $and: [{
      //   username: req.body.username
      // }, {
      //   password: req.body.password
      // }]
    }).then(response => {
      if (response.length){
        const token = jwt.sign({
          _id:response[0]._id,
          username: response[0].username,
          position: response[0].position,
          team:response[0].team
        });
        let data = {'token':token,'username':response[0].username,'position':response[0].position,'team':response[0].team};
        return res.status(200).json(data)
      }
      else{return res.status(404).json(0)}
    });
  });
});


module.exports = router;