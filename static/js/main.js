$(document).ready(function () {

  // Sidebar toggle
  $('#sidebarToggle').on('click', function () {
    $('#sidebar, #sidebarOverlay').addClass('open');
    $('body').addClass('sidebar-open');
  });
  $('#sidebarOverlay').on('click', function () {
    $('#sidebar, #sidebarOverlay').removeClass('open');
    $('body').removeClass('sidebar-open');
  });
  $('.sidebar-item').on('click', function () {
    $('#sidebar, #sidebarOverlay').removeClass('open');
    $('body').removeClass('sidebar-open');
  });

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
      $('#confirmSchool').text(school.name);
      $('#confirmTotal').text('MWK ' + school.amount);
    }
  }

  // ── Password Toggle ─────────────────────────────────
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

  // ── Phone Input — Digits Only ───────────────────────
  $('.auth-phone-input').on('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  // ── Multi-Step Navigation ───────────────────────────
  var currentStep = 1;
  var parentPhone = '';

  function goToStep(step) {
    currentStep = step;
    $('.step-panel').addClass('step-panel-hidden');
    $('#step' + step + 'Panel').removeClass('step-panel-hidden');

    $('.step-item').removeClass('active completed');
    for (var i = 1; i <= 3; i++) {
      if (i === step) {
        $('.step-item[data-step="' + i + '"]').addClass('active');
      } else if (i < step) {
        $('.step-item[data-step="' + i + '"]').addClass('completed');
      }
    }
  }

  // Step 1 → Step 2
  $('#step1Next').on('click', function () {
    var name = $('#studentName').val().trim();
    var level = $('#studentLevel').val();
    var error = '';

    if (!name) error = 'Please enter the student full name';
    else if (!level) error = 'Please select the level of study';

    if (error) {
      $('#step1Error').text(error);
      return;
    }

    $('#step1Error').text('');
    goToStep(2);
  });

  // ── Parent Auth Flow (Step 2) ───────────────────────

  function getRegisteredParents() {
    return JSON.parse(localStorage.getItem('registeredParents') || '{}');
  }

  function saveRegisteredParents(data) {
    localStorage.setItem('registeredParents', JSON.stringify(data));
  }

  function showAuthSubStep(stepId) {
    $('.auth-step').addClass('auth-step-hidden');
    $('#' + stepId).removeClass('auth-step-hidden');
  }

  $('#parentAuthContinue').on('click', function () {
    var phone = $('#parentPhone').val().trim();
    parentPhone = phone;

    if (!phone || phone.length < 9) {
      $('#phoneError').text('Please enter a valid phone number (9 digits)');
      return;
    }
    $('#phoneError').text('');

    var registeredParents = getRegisteredParents();

    if (registeredParents[phone]) {
      $('#loginPhoneDisplay').text('+265 ' + phone);
      $('#loginStepError').text('');
      $('#parentLoginPass').val('');
      showAuthSubStep('stepLogin');
    } else {
      $('#signupPhoneDisplay').text('+265 ' + phone);
      $('#signupStepError').text('');
      $('#parentSignupPass').val('');
      $('#parentSignupConfirm').val('');
      showAuthSubStep('stepSignup');
    }
  });

  $('#parentSignupBack, #parentLoginBack').on('click', function () {
    showAuthSubStep('stepPhone');
    $('#phoneError').text('');
  });

  function proceedToStep3(phone) {
    // Populate confirmation
    $('#confirmStudent').text($('#studentName').val().trim());
    $('#confirmLevel').text($('#studentLevel option:selected').text());
    $('#confirmPhone').text('+265 ' + phone);

    goToStep(3);
  }

  // Parent signup → create account
  $('#parentSignupBtn').on('click', function () {
    var pass = $('#parentSignupPass').val();
    var confirm = $('#parentSignupConfirm').val();
    var error = '';

    if (!pass || pass.length < 6) {
      error = 'Password must be at least 6 characters';
    } else if (pass !== confirm) {
      error = 'Passwords do not match';
    }

    if (error) {
      $('#signupStepError').text(error);
      return;
    }

    $('#signupStepError').text('');

    var registeredParents = getRegisteredParents();
    registeredParents[parentPhone] = pass;
    saveRegisteredParents(registeredParents);

    proceedToStep3(parentPhone);
  });

  // Parent login
  $('#parentLoginBtn').on('click', function () {
    var pass = $('#parentLoginPass').val();
    var registeredParents = getRegisteredParents();
    var error = '';

    if (!pass) {
      error = 'Please enter your password';
    } else if (registeredParents[parentPhone] !== pass) {
      error = 'Incorrect password. Please try again.';
    }

    if (error) {
      $('#loginStepError').text(error);
      return;
    }

    $('#loginStepError').text('');
    proceedToStep3(parentPhone);
  });

  // ── Step 3: Make Payment ────────────────────────────
  $('#makePaymentBtn').on('click', function () {
    alert('Payment of ' + $('#confirmTotal').text() + ' initiated successfully! (Backend not connected yet)');
  });

  // ── Login Form ──────────────────────────────────────
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
      window.location.href = '/school/headteacher/';
    }
  });

  // ── Headteacher Signup Form ─────────────────────────
  $('#headteacherSignupForm').on('submit', function (e) {
    e.preventDefault();
    var firstName = $('#htFirstName').val().trim();
    var lastName = $('#htLastName').val().trim();
    var email = $('#htEmail').val().trim();
    var phone = $('#htPhone').val().trim();
    var password = $('#htPassword').val();
    var confirm = $('#htConfirmPassword').val();
    var error = '';

    if (!firstName) error = 'Please enter your first name';
    else if (!lastName) error = 'Please enter your last name';
    else if (!email) error = 'Please enter your email';
    else if (!phone || phone.length < 9) error = 'Please enter a valid phone number (9 digits)';
    else if (!password || password.length < 6) error = 'Password must be at least 6 characters';
    else if (password !== confirm) error = 'Passwords do not match';

    if (error) {
      $('#htSignupError').text(error);
    } else {
      $('#htSignupError').text('');
      window.location.href = '/school/create/';
    }
  });

  // ── Create School Form ──────────────────────────────
  $('#createSchoolForm').on('submit', function (e) {
    e.preventDefault();
    var name = $('#schoolName').val().trim();
    var location = $('#schoolLocation').val().trim();
    var type = $('#schoolType').val();
    var error = '';

    if (!name) error = 'Please enter the school name';
    else if (!location) error = 'Please enter the school location';
    else if (!type) error = 'Please select the school type';

    if (error) {
      $('#createSchoolError').text(error);
    } else {
      $('#createSchoolError').text('');
      window.location.href = '/school/headteacher/';
    }
  });

  // ── Add Accountant Form ─────────────────────────────
  $('#addAccountantForm').on('submit', function (e) {
    e.preventDefault();
    var firstName = $('#accFirstName').val().trim();
    var lastName = $('#accLastName').val().trim();
    var email = $('#accEmail').val().trim();
    var phone = $('#accPhone').val().trim();
    var error = '';

    if (!firstName) error = 'Please enter the first name';
    else if (!lastName) error = 'Please enter the last name';
    else if (!email) error = 'Please enter the email';
    else if (!phone || phone.length < 9) error = 'Please enter a valid phone number';

    if (error) {
      $('#addAccountantError').text(error);
    } else {
      $('#addAccountantError').text('');
      alert('Accountant added! Default password: ' + lastName.toLowerCase().trim() + '123');
      window.location.href = '/school/headteacher/';
    }
  });

  // ── Change Password Form ────────────────────────────
  $('#changePasswordForm').on('submit', function (e) {
    e.preventDefault();
    var current = $('#currentPassword').val();
    var newPass = $('#newPassword').val();
    var confirm = $('#confirmNewPassword').val();
    var error = '';

    if (!current) error = 'Please enter your current password';
    else if (!newPass || newPass.length < 6) error = 'New password must be at least 6 characters';
    else if (newPass !== confirm) error = 'New passwords do not match';

    if (error) {
      $('#changePasswordError').text(error);
    } else {
      $('#changePasswordError').text('');
      alert('Password changed successfully!');
      window.location.href = '/school/accountant/';
    }
  });

});
