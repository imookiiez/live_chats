const express = require("express");
const bodyParser = require("body-parser");
const connectdb = require("./../dbconnect");
const Chats = require("./../models/Chat");
const jwt = require("./jwt");

const router = express.Router();

router.get("/",jwt.verify, function (req, res, next)
 {
  res.setHeader("Content-Type", "application/json");
  connectdb.then(db => {
    Chats.find({
      $or: [{
          $and: [{
            sender: "Anonymous"
          }, {
            received: "Me"
          }]
        },
        {
          $and: [{
            sender: "Me"
          }, {
            received: "Anonymous"
          }]
        }
      ]
    }).then(chat => {
      res.status(200).json(chat);
    });
  });
});

module.exports = router;