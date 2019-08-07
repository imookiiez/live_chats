var socket = io();
var sender = localStorage.getItem('n');
var position = localStorage.getItem('p');
var team = localStorage.getItem('tm');
var messages = document.getElementById("messages");
var listname = document.getElementById("listname");
var room 

(function () {
  $("form").submit(function (e) {
    let li = document.createElement("li");
    e.preventDefault(); // prevents page reloading
    let dataSend = {
      'msg': $("#message").val(),
      'sender': sender,
      'received': $("#received").val(),
      'room': room,
      'type': 'msg'
    }
    socket.emit("chat message", dataSend);

    messages.appendChild(li).append($("#message").val());
    let span = document.createElement("span");
    messages.appendChild(span).append("by " + sender + ": " + "just now");
    $("#message").val("");
    return false;
  });

  socket.on(room, data => {
    let li = document.createElement("li");
    let span = document.createElement("span");
    var messages = document.getElementById("messages");
    messages.appendChild(li).append(data.message);
    messages.appendChild(span).append("by " + data.received + ": " + "just now");
    console.log("Hello bingo!");
  });
})();

// fetching initial listuser from the database
(function () {
  console.log('ready');
  socket.emit('subscribe', { userId: sender });
  // fetch("/user/listname", {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'x-access-token': localStorage.getItem('t')
  //     }
  //   })
  //   .then(data => {
  //     return data.json();
  //   })
  //   .then(json => {
  //     json.map(data => {
  //       let li = document.createElement("li");
  //       let span = document.createElement("span");
  //       li.className = "name";
  //       li.setAttribute("data-id", data.username);
  //       li.setAttribute("onClick","startChat('"+data.username+"')");
  //       listname.appendChild(li).append(data.username)
  //     });
  //   })
  //   .catch(err => {
  //     // window.location = "/login.html"
  //   })
})();

function startChat(received) {
  $("#messages").html('');
  $("#received").val(received);
  $(".bottom_wrapper").removeClass('display-disable')
  // fetching initial chat messages from the database
  fetch("/chats", {
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('t'),
      'sender':sender,
      'received':received
    }
  })
  .then(data => {
    return data.json();
  })
  .then(json => {
    $("#room").val(json['room']);
    room = json['room'];
    json['chat'].map(data => {
      let li = document.createElement("li");
      let span = document.createElement("span");
      messages.appendChild(li).append(data.message);
      messages
        .appendChild(span)
        .append("by " + data.sender + ": " + formatTimeAgo(data.createdAt));
    });
  })
  .catch(err => {
    // window.location = "/login.html"
  })
  
}

//is typing...

let messageInput = document.getElementById("message");
let typing = document.getElementById("typing");

//isTyping event
messageInput.addEventListener("keypress", () => {
  socket.emit("typing", {
    user: "Someone",
    message: "is typing..."
  });
  console.log("is typing...");
});

socket.on("notifyTyping", data => {
  typing.innerText = data.user + " " + data.message;
  console.log(data.user + data.message);
});

//stop typing
messageInput.addEventListener("keyup", () => {
  socket.emit("stopTyping", "");
  console.log("stopTyping");

});

socket.on("notifyStopTyping", () => {
  typing.innerText = "";
});