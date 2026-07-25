$(document).ready(function () {

  // Mobile nav toggle
  $('#navToggle').on('click', function () {
    $('#navLinks').toggleClass('open');
  });

  // Close mobile nav on link click
  $('#navLinks a').on('click', function () {
    $('#navLinks').removeClass('open');
  });

  // School search filter
  $('#schoolSearch').on('keyup', function () {
    var value = $(this).val().toLowerCase();
    $('#schoolList .school-list-item').each(function () {
      var schoolName = $(this).find('.school-info h3').text().toLowerCase();
      var location = $(this).find('.school-info p').text().toLowerCase();
      if (schoolName.indexOf(value) > -1 || location.indexOf(value) > -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  // Bottom nav active state
  $('.bottom-nav-item').on('click', function (e) {
    e.preventDefault();
    $('.bottom-nav-item').removeClass('active');
    $(this).addClass('active');
  });

  // Pay Fees button — store school data and navigate
  $('.pay-fees-btn').on('click', function (e) {
    e.preventDefault();
    var schoolData = {
      name: $(this).data('school'),
      location: $(this).data('location'),
      type: $(this).data('type'),
      logo: $(this).data('logo'),
      amount: $(this).data('amount')
    };
    localStorage.setItem('selectedSchool', JSON.stringify(schoolData));
    window.location.href = '/pay-fees/';
  });

  // Pay Fees page — populate school data from localStorage
  if ($('#schoolName').length) {
    var school = JSON.parse(localStorage.getItem('selectedSchool'));
    if (school) {
      $('#schoolName').text(school.name);
      $('#schoolLocation').text(school.location);
      $('#schoolType').text(school.type);
      $('#schoolLogo').attr('src', school.logo).attr('alt', school.name);
      $('#totalFees').text('MWK ' + school.amount);
      $('#feesBalance').text('MWK ' + school.amount);
    }
  }

  // Password toggle — show/hide
  $('.password-toggle').on('click', function () {
    var targetId = $(this).data('target');
    var input = $('#' + targetId);
    var icon = $(this).find('i');
    if (input.attr('type') === 'password') {
      input.attr('type', 'text');
      icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      input.attr('type', 'password');
      icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
  });

  // Phone input — digits only
  $('.auth-phone-input').on('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  // Login form validation
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    var phone = $('#loginPhone').val().trim();
    var password = $('#loginPassword').val();
    var error = '';

    if (!phone) {
      error = 'Please enter your phone number';
    } else if (phone.length < 9) {
      error = 'Phone number must be 9 digits';
    } else if (!password) {
      error = 'Please enter your password';
    } else if (password.length < 6) {
      error = 'Password must be at least 6 characters';
    }

    if (error) {
      $('#loginError').text(error);
    } else {
      $('#loginError').text('');
      alert('Login successful! (Backend not connected yet)');
    }
  });

  // Signup form validation
  $('#signupForm').on('submit', function (e) {
    e.preventDefault();
    var firstName = $('#signupFirstName').val().trim();
    var lastName = $('#signupLastName').val().trim();
    var phone = $('#signupPhone').val().trim();
    var password = $('#signupPassword').val();
    var confirmPassword = $('#signupConfirmPassword').val();
    var error = '';

    if (!firstName) {
      error = 'Please enter your first name';
    } else if (!lastName) {
      error = 'Please enter your last name';
    } else if (!phone) {
      error = 'Please enter your phone number';
    } else if (phone.length < 9) {
      error = 'Phone number must be 9 digits';
    } else if (!password) {
      error = 'Please enter a password';
    } else if (password.length < 6) {
      error = 'Password must be at least 6 characters';
    } else if (password !== confirmPassword) {
      error = 'Passwords do not match';
    }

    if (error) {
      $('#signupError').text(error);
    } else {
      $('#signupError').text('');
      alert('Account created successfully! (Backend not connected yet)');
    }
  });

});
