const express = require("express");
const connectdb = require("./../dbconnect");
const Chats = require("./../models/Chat");
const jwt = require("./jwt");

const router = express.Router();

router.get("/", jwt.verify, function (req, res, next) {
  var sender = req.headers["sender"];
  var received = req.headers["received"];
  res.setHeader("Content-Type", "application/json");
  connectdb.then(db => {
    Chats.find({
      $or: [{
          $and: [{
            sender: sender
          }, {
            received: received
          }]
        },
        {
          $and: [{
            sender: received
          }, {
            received: sender
          }]
        }
      ]
    }).then(chat => {
      res.status(200).json(chat);
    });

  });
});

// router.get('/users', (req, res) => {
//   res.send(JSON.stringify(userList));
// })

module.exports = router;