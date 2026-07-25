$(document).ready(function () {

  // Mobile nav toggle
  $('#navToggle').on('click', function () {
    $('#navLinks').toggleClass('open');
  });

  // Close mobile nav on link click
  $('#navLinks a').on('click', function () {
    $('#navLinks').removeClass('open');
  });

  // CSRF token helper for AJAX
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = $.trim(cookies[i]);
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  $.ajaxSetup({
    beforeSend: function (xhr) {
      xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    }
  });

});
