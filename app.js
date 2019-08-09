//require the express module
const express = require("express");
const app = express();
const dateTime = require("simple-datetime-formater");
const bodyParser = require("body-parser");
const fs = require('fs');
const chatRouter = require("./route/chatroute");
const loginRouter = require("./route/loginRoute");
const registerRouter = require("./route/registerRouter");

//require the http module
const http = require("http").Server(app);

// require the socket.io module
const io = require('socket.io')(http);

const port = 5000;

let userList = [];
//bodyparser middleware
app.use(bodyParser.json());
//route
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/login.html');
});
app.get('/chat', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.use("/chats", chatRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.get('/users', (req, res) => {
  res.send(JSON.stringify(userList));
})


//set the express.static middleware
app.use(express.static(__dirname + "/public"));


//database connection
const Chat = require("./models/Chat");
const connect = require("./dbconnect");

//setup event listener
io.on("connection", socket => {
  console.log("user connected");
  socket.on('subscribe', function (data) {
    console.log('subscribe');
    if (typeof data === "undefined") {
      io.to(socket.id).emit('sent-to-user', 'userId is undefined');
      console.log('the property is not available...');
    } else {
      io.emit('sent-to-connect', data.userId + ' connected');
      // io.to(socket.id).emit('sent-to-user', data.userId + ' connected');
      let indexArray = userList.findIndex((item) => item.userId == data.userId.toLowerCase());
      if (indexArray != -1) {
        userList.splice(indexArray, 1)
      };
      console.log('subscribe remove ' + data.userId.toLowerCase() + ' completed new socket.id=' + socket.id);
      userList.push({
        userId: data.userId.toLowerCase(),
        socketId: socket.id,
        position: data.position,
        team: data.team
      });
      // io.to(socket.id).emit('sent-to-user', 'user : ' + data.userId.toLowerCase() + " position : " + data.position + ' is connected' + ' socket.id=' + socket.id);
      // io.emit('sent-to-user', 'user : ' + data.userId.toLowerCase() + " position : " + data.position + ' is connected' + ' socket.id=' + socket.id);
    }
  });


  socket.on("disconnect", function (socket) {
    console.log("user disconnected " + socket.id);
  });

  //Someone is typing
  socket.on("typing", data => {
    socket.broadcast.emit("notifyTyping", {
      user: data.user,
      message: data.message
    });
  });

  //when soemone stops typing
  socket.on("stopTyping", () => {
    socket.broadcast.emit("notifyStopTyping");
  });

  socket.on("sent-to-user", function (response) {
    // console.log(response);
    //broadcast message to everyone in port:5000 except yourself.
    if ('msg' == response.type) {
      socket.to(response.socketReceived).emit('Received', {
        message: response.msg,
        sender: response.sender,
        received: response.sender,
        type: response.type
      });
      //save chat to the database
      connect.then(db => {
        console.log("connected correctly to the server");
        let chatMessage = new Chat({
          message: response.msg,
          sender: response.sender,
          received: response.received,
          type: response.type,
        });
        chatMessage.save();
      });

    } else if ('file' == response.type || 'image' == response.type) {
      if (response.file) {
        let path = '/asset/uploads/' + response.name;
        fs.writeFile("public" + path, response.file, function (err) {
          if (err) {
            console.log('File could not be saved.');
          } else {
            socket.to(response.socketReceived).emit('Received', {
              message: path,
              sender: response.sender,
              received: response.sender,
              type: response.type
            });
            //save chat to the database
            connect.then(db => {
              console.log("connected correctly to the server");
              let chatMessage = new Chat({
                message: path,
                sender: response.sender,
                received: response.received,
                type: response.type,
              });
              chatMessage.save();
            });
          }
        });
      }
    } else {

    }

  });

  Array.prototype.remove = function () {
    var what, a = arguments,
      L = a.length,
      ax;
    while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
        this.splice(ax, 1);
      }
    }
    return this;
  };
});

http.listen(port, () => {
  console.log("Running on Port: " + port);
});