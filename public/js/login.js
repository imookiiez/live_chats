$('.btn').click(function (e) {
  $.ajax({
      method: 'POST',
      url: '/login',
      data: ({
        "username": $('.email').val(),
        "password": $('.password').val()
      })
    })
    .done(function (msg) {
      console.log(msg);
     if(msg){
       alert("username or password Incorrect")
      }else{
        window.location = "/"
      }
    });
})