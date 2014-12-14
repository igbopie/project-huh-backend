jQuery(document).ready(function () {
  $("time.timeago").timeago();
});


function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function postIndexForm() {
  var email = $('#email').val();
  if ((email !== "") && (validateEmail(email))) {
    $.ajax({
      url: "https://docs.google.com/forms/d/1qDgvTpTphA7J5K0t6dWieZxDPfdX8_7oX0y0ihicvuA/formResponse",
      data: {"entry.1958676995": email},
      type: "POST",
      dataType: "xml"

    }).complete(function () {
      $("#spinner").slideUp();
      $("#thanks").removeClass("invisible hide").slideDown();
    });

    $("#interested").slideUp();

    $("#spinner").removeClass("invisible hide").slideDown();
  }
  else {
    //Error message
  }
}