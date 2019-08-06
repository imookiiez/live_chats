const express = require("express");
const bodyParser = require("body-parser");
const connectdb = require("../dbconnect");
const Users = require("../models/User");
const jwt = require("./jwt");

const router = express.Router();

router.get("/listname", jwt.verify, function (req, res, next) {
  let team = req.team;
  let username = req.username;
  let position = req.position;
  connectdb.then(db => {
    Users.find({
      $and: [{
          team: team
        },
        {
          position: {
            $nin: [position]
          }
        }
      ]
    }, {
      username: 1,
      position: 1
    }).then(Response => {
      res.status(200).json(Response);
    });
  })
})

module.exports = router;