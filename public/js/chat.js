var socket = io();
var sender = localStorage.getItem('n');
var position = localStorage.getItem('p');
var team = localStorage.getItem('tm');
var messages = document.getElementById("messages");
var listname = document.getElementById("listname");
var socketReceived;
var userlist;


(function () {
  $("#message").keyup(function (e) {
    if (e.keyCode == 13) {
      $(".send_message").trigger("click");
    }
  })
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
    li.setAttribute("class", "sender");
    messages.appendChild(li).append($("#message").val());
    let span = document.createElement("span");
    messages.appendChild(span).append("by " + sender + ": " + "just now");
    toBottom()
    $("#message").val("");
    return false;
  });

  $(".send_file").click(function () {
    $("#file").trigger("click");
  })

  $('#file').change(function () {

    let files = $(this).context.files[0];
    let path = $(this).context.files[0].name;
    let type = path.split('.');
    let filesName = Date.now() + "_" + Math.floor(1000 + Math.random() * 9000);
    let li = document.createElement("li");
    let img = document.createElement("img");
    let alink = document.createElement("a");
    let span = document.createElement("span");
    if (isImage(type[type.length - 1])) {
      let dataSend = {
        'file': files,
        'name': filesName + "." + type[type.length - 1],
        'sender': sender,
        'received': $("#received").val(),
        'type': 'image',
        'socketReceived': socketReceived
      }
      socket.emit("sent-to-user", dataSend);
      let Render = new FileReader()
      Render.readAsDataURL(files)
      Render.onload = () => {
        img.setAttribute('src', Render.result);
        img.setAttribute('width', '40%');
        alink.setAttribute('target', '_blank');
        alink.setAttribute('href', "/asset/uploads/" + filesName + "." + type[type.length - 1]);
        // messages.appendChild(alink).append(img);
        alink.appendChild(img);
        li.setAttribute("class", "background-transparent");
        messages.appendChild(li).append(alink)
        messages.appendChild(span).append("by " + sender + ": " + "just now");
        $("#file").val("");
        toBottom()
        return false;
      }
    } else {
      let dataSend = {
        'file': files,
        'name': filesName + "." + type[type.length - 1],
        'sender': sender,
        'received': $("#received").val(),
        'type': 'file',
        'socketReceived': socketReceived
      }
      socket.emit("sent-to-user", dataSend);

      let li = document.createElement("li");
      let alink = document.createElement("a");
      let span = document.createElement("span");
      alink.setAttribute('target', '_blank');
      alink.setAttribute('href', "/asset/uploads/" + filesName + "." + type[type.length - 1]);
      messages.appendChild(alink).append(filesName + "." + type[type.length - 1])
      li.setAttribute("class", "sender");
      messages.appendChild(li).append(alink);
      messages.appendChild(span).append("by " + sender + ": " + "just now");
      $("#file").val("");
      toBottom()
      return false;
    }
  })

  socket.on('Received', data => {
    let li = document.createElement("li");
    let img = document.createElement("img");
    let span = document.createElement("span");
    let alink = document.createElement("a");
    li.setAttribute("class", "received");
    if (data.sender = $('#received').val()) {
      if ("msg" == data.type) {
        messages.appendChild(li).append(data.message);
      } else if ("image" == data.type) {
        img.setAttribute('src', data.message);
        img.setAttribute('width', '40%');
        alink.setAttribute('target', '_blank');
        alink.setAttribute('href', data.message);
        alink.appendChild(img);
        li.setAttribute("class", "background-transparent");
        messages.appendChild(li).append(alink)
      } else if ("file" == data.type) {
        let filename = data.message.split('/');
        alink.setAttribute('target', '_blank');
        alink.setAttribute('href', data.message);
        messages.appendChild(alink).append(filename[filename.length - 1])
        messages.appendChild(li).append(alink);
      }
      messages.appendChild(span).append("by " + data.received + ": " + "just now");
      toBottom()
    }
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
      userlist = JSON.stringify(json);
      json.map(data => {
        if (sender != data.userId && position != data.position && team == data.team) {
          let li = document.createElement("li");
          li.setAttribute('class', "name " + data.userId);
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
  received = received;
  console.log(received);
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
        let img = document.createElement("img");
        let alink = document.createElement("a");
        let span = document.createElement("span");
        if (data.sender == sender) {
          li.setAttribute("class", "sender");
        } else {
          li.setAttribute("class", "received");
        }
        if ("msg" == data.type) {
          messages.appendChild(li).append(data.message);
        } else if ("image" == data.type) {
          img.setAttribute('src', data.message);
          img.setAttribute('width', '40%');
          alink.setAttribute('target', '_blank');
          alink.setAttribute('href', data.message);
          alink.appendChild(img);
          li.setAttribute("class", "background-transparent");
          messages.appendChild(li).append(alink)
        } else if ("file" == data.type) {
          let filename = data.message.split('/');
          alink.setAttribute('target', '_blank');
          alink.setAttribute('href', data.message);
          messages.appendChild(alink).append(filename[filename.length - 1])
          messages.appendChild(li).append(alink);
        }
        messages
          .appendChild(span)
          .append("by " + data.sender + ": " + formatTimeAgo(data.createdAt));
        // span.append("by " + data.sender + ": " + formatTimeAgo(data.createdAt));
        // messages.appendChild(li).append(span);
      });
      toBottom()
    })
    .catch(err => {
      window.location = "/"
    });

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
  // console.log("is typing...");
});

socket.on("notifyTyping", data => {
  typing.innerText = data.user + " " + data.message;
  // console.log(data.user + data.message);
});

//stop typing
messageInput.addEventListener("keyup", () => {
  socket.emit("stopTyping", "");
  // console.log("stopTyping");

});

socket.on("notifyStopTyping", () => {
  typing.innerText = "";
});

function read(sender) {
  $("." + sender).trigger("click");
}

function toBottom() {
  // var element = document.getElementById('messages');
  // element.scrollTo(0, element.scrollHeight)
  setTimeout(function () {
    var element = document.getElementById('messages');
    element.scrollTo(0, element.scrollHeight)
  }, 150);
}

function isImage(ext) {
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpge':
    case 'gif':
    case 'bmp':
    case 'png':
      return true;
  }
  return false;
}