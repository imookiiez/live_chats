$('.btn').click(function (e) {
  $.ajax({
    method: 'POST',
    url: '/login',
    data: {
      "username": $('.email').val(),
      // "password": $('.password').val()
    },
    statusCode: {
      404: function () {
        alert("username or password Incorrect")
      },
      200: function (response) {
        localStorage.setItem('t', response.token);
        localStorage.setItem('n', response.username);
        localStorage.setItem('p', response.position);
        localStorage.setItem('tm', response.team);
        window.location = "/"
      }
    }
  })
})