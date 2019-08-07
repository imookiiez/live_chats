//require the express module
const express = require("express");
const app = express();
const dateTime = require("simple-datetime-formater");
const bodyParser = require("body-parser");
const chatRouter = require("./route/chatroute");
const loginRouter = require("./route/loginRoute");
const registerRouter = require("./route/registerRouter");
const userRouter = require("./route/userRouter");

//require the http module
const http = require("http").Server(app);

// require the socket.io module
const io = require('socket.io')(http);

const port = 5000;

let userList = [];
//bodyparser middleware
app.use(bodyParser.json());

//route
app.use("/chats", chatRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/user", userRouter);
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
      io.to(socket.id).emit('sent-to-user', data.userId+'connected');
      let indexArray = userList.findIndex((item) => item.userId == data.userId.toLowerCase());
      if (indexArray != -1) {
        userList.splice(indexArray, 1)
      };
      console.log('subscribe remove ' + data.userId.toLowerCase() + ' completed new socket.id=' + socket.id);
      userList.push({
        userId: data.userId.toLowerCase(),
        socketId: socket.id
      });
      io.to(socket.id).emit('sent-to-user', 'userId:' + data.userId.toLowerCase() + 'is connected' + ' socket.id=' + socket.id);
    }
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
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

  socket.on("chat message", function (response) {
    console.log(response);
    //broadcast message to everyone in port:5000 except yourself.
    socket.broadcast.emit(response.room, {
      message: response.msg,
      received: response.sender
    });

    //save chat to the database
    connect.then(db => {
      console.log("connected correctly to the server");
      let chatMessage = new Chat({
        message: response.msg,
        sender: response.sender,
        received: response.received,
        room: response.room,
        type: response.type,
      });
      chatMessage.save();
    });

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