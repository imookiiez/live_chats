var socket = io();
var sender = localStorage.getItem('n');
var position = localStorage.getItem('p');
var team = localStorage.getItem('tm');
var messages = document.getElementById("messages");
var listname = document.getElementById("listname");
var socketReceived;

(function () {
  $(".send_message").click(function (e) {
    let li = document.createElement("li");
    // e.preventDefault(); // prevents page reloading
    let dataSend = {
      'msg': $("#message").val(),
      'sender': sender,
      'received': $("#received").val(),
      'type': 'msg',
      'socketReceived': socketReceived
    }
    socket.emit("sent-to-user", dataSend);

    messages.appendChild(li).append($("#message").val());
    let span = document.createElement("span");
    messages.appendChild(span).append("by " + sender + ": " + "just now");
    $("#message").val("");
    return false;
  });

  $(".send_file").click(function () {
    $( "#file" ).trigger( "click" );
  })

  $('#file').change(function(){

    let files = $(this).context.files[0];
    let dataSend = {
      'file': files,
      'sender': sender,
      'received': $("#received").val(),
      'type': 'file',
      'socketReceived': socketReceived
    }
    console.log('send');
    console.log(dataSend);
    alert(JSON.stringify(dataSend))
  })

  socket.on('Received', data => {
    let li = document.createElement("li");
    let span = document.createElement("span");
    var messages = document.getElementById("messages");
    messages.appendChild(li).append(data.message);
    messages.appendChild(span).append("by " + data.received + ": " + "just now");
  });

})();

socket.on('sent-to-connect', function (msg) {
  // console.log(msg);
  fetch("/users", {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('t')
      }
    })
    .then(data => {
      return data.json();
    })
    .then(json => {
      $("#listname").html('');
      json.map(data => {
        if (sender != data.userId && position != data.position && team == data.team) {
          let li = document.createElement("li");
          li.className = "name";
          li.setAttribute("onClick", "startChat('" + data.userId + "','" + data.socketId + "')");
          listname.appendChild(li).append(data.userId)
        }
      });
    })
    .catch(err => {
      window.location = "/"
    })
});

// fetching initial listuser from the database
(function () {
  console.log('ready');
  socket.emit('subscribe', {
    userId: sender,
    position: position,
    team: team
  });
})();

function startChat(received, socketId) {
  $("#messages").html('');
  $("#received").val(received);
  socketReceived = socketId;
  $(".bottom_wrapper").removeClass('display-disable')
  // fetching initial chat messages from the database
  fetch("/chats", {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('t'),
        'sender': sender,
        'received': received
      }
    })
    .then(data => {
      return data.json();
    })
    .then(json => {
      json.map(data => {
        let li = document.createElement("li");
        let span = document.createElement("span");
        messages.appendChild(li).append(data.message);
        messages
          .appendChild(span)
          .append("by " + data.sender + ": " + formatTimeAgo(data.createdAt));
      });
    })
    .catch(err => {
      window.location = "/"
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