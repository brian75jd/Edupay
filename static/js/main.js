$(document).ready(function () {

  // Seed demo accounts — merge into existing to always keep demo credentials
  var staffAccounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
  var demoAccounts = {
    "999999999": {
      password: "head123",
      role: "headteacher",
      firstName: "John",
      lastName: "Banda",
      email: "john.banda@edupay.mw"
    },
    "888888888": {
      password: "acc123",
      role: "accountant",
      firstName: "Grace",
      lastName: "Mhango",
      email: "grace.mhango@edupay.mw"
    }
  };
  Object.keys(demoAccounts).forEach(function (key) {
    if (!staffAccounts[key]) staffAccounts[key] = demoAccounts[key];
  });
  localStorage.setItem('staffAccounts', JSON.stringify(staffAccounts));

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
      return;
    }

    var staffAccounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
    var account = staffAccounts[phone];

    if (!account) {
      $('#loginError').text('No account found with this phone number');
      return;
    }

    if (account.password !== password) {
      $('#loginError').text('Incorrect password');
      return;
    }

    $('#loginError').text('');

    // Store current session
    localStorage.setItem('currentUser', JSON.stringify({
      phone: phone,
      role: account.role,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email || ''
    }));

    // Redirect based on role
    if (account.role === 'headteacher') {
      window.location.href = '/school/headteacher/';
    } else if (account.role === 'accountant') {
      window.location.href = '/school/accountant/';
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
      return;
    }

    $('#htSignupError').text('');

    // Save account to localStorage
    var staffAccounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
    staffAccounts[phone] = {
      password: password,
      role: 'headteacher',
      firstName: firstName,
      lastName: lastName,
      email: email
    };
    localStorage.setItem('staffAccounts', JSON.stringify(staffAccounts));

    // Store current session
    localStorage.setItem('currentUser', JSON.stringify({
      phone: phone,
      role: 'headteacher',
      firstName: firstName,
      lastName: lastName
    }));

    window.location.href = '/school/create/';
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
      return;
    }

    $('#createSchoolError').text('');

    // Save school to localStorage
    localStorage.setItem('schoolInfo', JSON.stringify({
      name: name,
      location: location,
      type: type
    }));

    window.location.href = '/school/headteacher/';
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
      return;
    }

    $('#addAccountantError').text('');

    var defaultPassword = lastName.toLowerCase().trim() + '123';

    // Save accountant account to localStorage
    var staffAccounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
    staffAccounts[phone] = {
      password: defaultPassword,
      role: 'accountant',
      firstName: firstName,
      lastName: lastName,
      email: email,
      mustChangePassword: true
    };
    localStorage.setItem('staffAccounts', JSON.stringify(staffAccounts));

    alert('Accountant added! Default password: ' + defaultPassword);
    window.location.href = '/school/headteacher/';
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
      return;
    }

    $('#changePasswordError').text('');

    // Update password in localStorage
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.phone) {
      var staffAccounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
      if (staffAccounts[currentUser.phone]) {
        staffAccounts[currentUser.phone].password = newPass;
        staffAccounts[currentUser.phone].mustChangePassword = false;
        localStorage.setItem('staffAccounts', JSON.stringify(staffAccounts));
      }
    }

    alert('Password changed successfully!');
    window.location.href = '/school/accountant/';
  });

  // ── Dashboard SPA ──────────────────────────────────
  if ($('#panelContainer').length) {

    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var role = currentUser.role === 'accountant' ? 'ac' : 'ht';
    var loadedPanels = {};
    var editingAccPhone = null;

    // Seed transactions
    if (!localStorage.getItem('transactions')) {
      localStorage.setItem('transactions', JSON.stringify([
        { id: "RCP20260723-001", student: "Chifundo Banda", level: "Form 3", amount: 120000, date: "2026-07-23", method: "Airtel Money", status: "Paid" },
        { id: "RCP20260723-002", student: "Grace Mlenga", level: "Form 1", amount: 60000, date: "2026-07-23", method: "TNM Mpamba", status: "Paid" },
        { id: "RCP20260722-003", student: "James Phiri", level: "Form 4", amount: 120000, date: "2026-07-22", method: "National Bank", status: "Paid" },
        { id: "RCP20260722-004", student: "Mary Kamwendo", level: "Form 2", amount: 45000, date: "2026-07-22", method: "Airtel Money", status: "Partial" },
        { id: "RCP20260721-005", student: "Peter Gondwe", level: "Form 3", amount: 120000, date: "2026-07-21", method: "TNM Mpamba", status: "Paid" },
        { id: "RCP20260721-006", student: "Linda Mwale", level: "Form 1", amount: 120000, date: "2026-07-21", method: "National Bank", status: "Paid" },
        { id: "RCP20260720-007", student: "Thoko Chips", level: "Form 4", amount: 80000, date: "2026-07-20", method: "Airtel Money", status: "Pending" },
        { id: "RCP20260720-008", student: "Fiona Banda", level: "Form 2", amount: 120000, date: "2026-07-20", method: "Airtel Money", status: "Paid" },
        { id: "RCP20260719-009", student: "David Mwale", level: "Form 3", amount: 60000, date: "2026-07-19", method: "TNM Mpamba", status: "Paid" },
        { id: "RCP20260718-010", student: "Ruth Banda", level: "Form 1", amount: 120000, date: "2026-07-18", method: "National Bank", status: "Paid" },
        { id: "RCP20260717-011", student: "Isaac Mwale", level: "Form 4", amount: 45000, date: "2026-07-17", method: "Airtel Money", status: "Partial" },
        { id: "RCP20260716-012", student: "Sarah Phiri", level: "Form 2", amount: 120000, date: "2026-07-16", method: "TNM Mpamba", status: "Paid" },
        { id: "RCP20260715-013", student: "Kondwani Banda", level: "Form 3", amount: 120000, date: "2026-07-15", method: "Airtel Money", status: "Paid" },
        { id: "RCP20260714-014", student: "Mphatso Mwale", level: "Form 1", amount: 60000, date: "2026-07-14", method: "National Bank", status: "Pending" },
        { id: "RCP20260713-015", student: "Tionge Phiri", level: "Form 2", amount: 120000, date: "2026-07-13", method: "TNM Mpamba", status: "Paid" }
      ]));
    }

    // Seed students
    if (!localStorage.getItem('students')) {
      localStorage.setItem('students', JSON.stringify([
        { name: "Chifundo Banda", level: "Form 3", phone: "999123456", amount: 120000, date: "2026-07-23", term: "Term 2" },
        { name: "Grace Mlenga", level: "Form 1", phone: "888234567", amount: 60000, date: "2026-07-23", term: "Term 2" },
        { name: "James Phiri", level: "Form 4", phone: "777345678", amount: 120000, date: "2026-07-22", term: "Term 2" },
        { name: "Mary Kamwendo", level: "Form 2", phone: "666456789", amount: 45000, date: "2026-07-22", term: "Term 2" },
        { name: "Peter Gondwe", level: "Form 3", phone: "555567890", amount: 120000, date: "2026-07-21", term: "Term 2" },
        { name: "Linda Mwale", level: "Form 1", phone: "444678901", amount: 120000, date: "2026-07-21", term: "Term 2" },
        { name: "Thoko Chips", level: "Form 4", phone: "333789012", amount: 80000, date: "2026-07-20", term: "Term 2" },
        { name: "Fiona Banda", level: "Form 2", phone: "222890123", amount: 120000, date: "2026-07-20", term: "Term 2" },
        { name: "David Mwale", level: "Form 3", phone: "111901234", amount: 60000, date: "2026-07-19", term: "Term 1" },
        { name: "Ruth Banda", level: "Form 1", phone: "998012345", amount: 120000, date: "2026-07-18", term: "Term 1" },
        { name: "Isaac Mwale", level: "Form 4", phone: "887123456", amount: 45000, date: "2026-07-17", term: "Term 1" },
        { name: "Sarah Phiri", level: "Form 2", phone: "776234567", amount: 120000, date: "2026-07-16", term: "Term 1" }
      ]));
    }

    // ── Hash Router ──────────────────────────────────
    function loadPanel(key) {
      if (loadedPanels[key]) {
        showPanel(key, true);
        return;
      }
      $.get('/static/html/' + role + '_' + key + '.html', function(html) {
        $('#panelContainer').html(html);
        loadedPanels[key] = true;
        showPanel(key, true);
        populatePanel(key);
      });
    }

    function showPanel(key, doPopulate) {
      $('.sidebar-item').removeClass('active');
      $('.sidebar-item[href="#' + key + '"]').addClass('active');
      if (doPopulate && loadedPanels[key]) {
        populatePanel(key);
      }
    }

    function populatePanel(key) {
      if (role === 'ht') {
        if (key === 'dashboard') populateHtDashboard();
        else if (key === 'school') populateHtSchool();
        else if (key === 'accountants') populateHtAccountants();
        else if (key === 'transactions') populateHtTransactions();
        else if (key === 'students') populateHtStudents();
        else if (key === 'profile') populateHtProfile();
      } else {
        if (key === 'dashboard') populateAcDashboard();
        else if (key === 'transactions') populateAcTransactions();
        else if (key === 'students') populateAcStudents();
        else if (key === 'profile') populateAcProfile();
      }
    }

    function fmtMoney(amount) {
      return 'MWK ' + Number(amount).toLocaleString();
    }

    function fmtDate(d) {
      var parts = d.split('-');
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return parseInt(parts[2]) + ' ' + months[parseInt(parts[1])-1] + ' ' + parts[0];
    }

    $(window).on('hashchange', function() {
      var key = location.hash.replace('#', '') || 'dashboard';
      loadPanel(key);
    });

    // Check if accountant must change password
    if (role === 'ac' && currentUser.phone) {
      var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
      if (accounts[currentUser.phone] && accounts[currentUser.phone].mustChangePassword) {
        location.hash = 'profile';
      }
    }

    var initialKey = location.hash.replace('#', '') || 'dashboard';
    loadPanel(initialKey);

    // ── Sidebar click ──────────────────────────────
    $('.sidebar-nav').on('click', '.sidebar-item', function(e) {
      e.preventDefault();
      var hash = $(this).attr('href').replace('#', '');
      location.hash = hash;
    });

    // ── Logout ─────────────────────────────────────
    $('#logoutLink').on('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    });

    // ── Modal Close ────────────────────────────────
    $(document).on('click', '.modal-close-btn', function() {
      $('.modal-overlay, .modal').removeClass('open');
    });
    $(document).on('click', '.modal-overlay', function() {
      $('.modal-overlay, .modal').removeClass('open');
    });

    // ── Helper: Render Badge ───────────────────────
    function statusBadge(status) {
      if (status === 'Paid' || status === 'Active' || status === 'Verified') {
        return '<span class="badge badge-success">' + status + '</span>';
      } else if (status === 'Partial' || status === 'Pending') {
        return '<span class="badge badge-pending">' + status + '</span>';
      }
      return '<span class="badge badge-failed">' + status + '</span>';
    }

    function methodIcon(method) {
      if (method === 'Airtel Money') return '<i class="fa-solid fa-mobile-screen-button method-icon-airtel"></i> Airtel';
      if (method === 'TNM Mpamba') return '<i class="fa-solid fa-mobile-screen-button method-icon-tnm"></i> TNM';
      if (method === 'National Bank') return '<i class="fa-solid fa-building-columns method-icon-bank"></i> NB';
      return method;
    }

    // ════════════════════════════════════════════════
    //  HEADTEACHER PANELS
    // ════════════════════════════════════════════════

    function populateHtDashboard() {
      var user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      var school = JSON.parse(localStorage.getItem('schoolInfo') || '{}');
      var txns = JSON.parse(localStorage.getItem('transactions') || '[]');

      $('#htWelcomeName').text((user.firstName || '') + ' ' + (user.lastName || ''));
      $('#htSchoolName').text(school.name || '—');
      $('#htSchoolLocation').text(school.location || '—');

      var totalRevenue = 0, totalPaid = 0, totalPending = 0;
      txns.forEach(function(t) {
        totalRevenue += t.amount;
        if (t.status === 'Paid') totalPaid++;
        else if (t.status === 'Pending') totalPending++;
      });

      $('#htStatRevenue').text(fmtMoney(totalRevenue));
      $('#htStatPaid').text(totalPaid);
      $('#htStatPending').text(totalPending);

      var allStudents = JSON.parse(localStorage.getItem('students') || '[]');
      // Count unique students as total
      var uniqueNames = {};
      allStudents.forEach(function(s) { uniqueNames[s.name] = true; });
      $('#htStatTotal').text(Object.keys(uniqueNames).length);

      // Recent 5 transactions
      var recent = txns.slice(-5).reverse();
      var html = '';
      recent.forEach(function(t) {
        html += '<tr><td>' + t.student + '</td><td>' + t.level + '</td><td>' + fmtMoney(t.amount) + '</td><td>' + fmtDate(t.date) + '</td><td>' + methodIcon(t.method) + '</td><td>' + statusBadge(t.status) + '</td></tr>';
      });
      $('#htRecentTransactions').html(html);
    }

    function populateHtSchool() {
      var school = JSON.parse(localStorage.getItem('schoolInfo') || '{}');
      $('#schoolDisplayName').text(school.name || 'Not set');
      $('#schoolDisplayLocation').text(school.location || 'Not set');
      $('#schoolDisplayType').text(school.type || 'Not set');
      $('#schoolName').val(school.name || '');
      $('#schoolLocation').val(school.location || '');
      $('#schoolType').val(school.type || '');
      $('#schoolDisplay').show();
      $('#schoolEditForm').hide();
      $('#schoolError').text('');

      $('#schoolEditBtn').off('click').on('click', function() {
        $('#schoolDisplay').hide();
        $('#schoolEditForm').show();
      });
      $('#schoolCancelBtn').off('click').on('click', function() {
        var s = JSON.parse(localStorage.getItem('schoolInfo') || '{}');
        $('#schoolName').val(s.name || '');
        $('#schoolLocation').val(s.location || '');
        $('#schoolType').val(s.type || '');
        $('#schoolDisplay').show();
        $('#schoolEditForm').hide();
        $('#schoolError').text('');
      });
      $('#schoolSaveBtn').off('click').on('click', function() {
        var name = $('#schoolName').val().trim();
        var location = $('#schoolLocation').val().trim();
        var type = $('#schoolType').val();
        if (!name || !location || !type) {
          $('#schoolError').text('Please fill in all fields');
          return;
        }
        $('#schoolError').text('');
        localStorage.setItem('schoolInfo', JSON.stringify({ name: name, location: location, type: type }));
        $('#schoolDisplayName').text(name);
        $('#schoolDisplayLocation').text(location);
        $('#schoolDisplayType').text(type);
        $('#schoolDisplay').show();
        $('#schoolEditForm').hide();
      });
    }

    function populateHtAccountants() {
      var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
      var html = '';
      Object.keys(accounts).forEach(function(phone) {
        if (accounts[phone].role !== 'accountant') return;
        var a = accounts[phone];
        var status = a.mustChangePassword ? 'Pending' : 'Active';
        html += '<tr>' +
          '<td>' + a.firstName + ' ' + a.lastName + '</td>' +
          '<td>' + (a.email || '—') + '</td>' +
          '<td>+265 ' + phone + '</td>' +
          '<td>' + statusBadge(status) + '</td>' +
          '<td>' +
            '<button class="btn btn-sm btn-outline acc-edit-btn" data-phone="' + phone + '" style="margin-right:6px;"><i class="fa-solid fa-pen"></i></button>' +
            '<button class="btn btn-sm btn-outline acc-delete-btn" data-phone="' + phone + '" data-name="' + a.firstName + ' ' + a.lastName + '"><i class="fa-solid fa-trash"></i></button>' +
          '</td>' +
        '</tr>';
      });
      $('#accountantTable').html(html);

      // Add Accountant
      $('#addAccountantBtn').off('click').on('click', function() {
        editingAccPhone = null;
        $('#accountantModalTitle').text('Add Accountant');
        $('#accModalFirstName, #accModalLastName, #accModalEmail, #accModalPhone').val('');
        $('#accModalError').text('');
        $('#accountantModal, #accountantModalOverlay').addClass('open');
      });

      // Edit
      $(document).off('click', '.acc-edit-btn').on('click', '.acc-edit-btn', function() {
        editingAccPhone = $(this).data('phone');
        var a = accounts[editingAccPhone];
        $('#accountantModalTitle').text('Edit Accountant');
        $('#accModalFirstName').val(a.firstName || '');
        $('#accModalLastName').val(a.lastName || '');
        $('#accModalEmail').val(a.email || '');
        $('#accModalPhone').val(editingAccPhone);
        $('#accModalError').text('');
        $('#accountantModal, #accountantModalOverlay').addClass('open');
      });

      // Delete
      $(document).off('click', '.acc-delete-btn').on('click', '.acc-delete-btn', function() {
        var phone = $(this).data('phone');
        var name = $(this).data('name');
        $('#confirmDeleteName').text(name);
        $('#confirmDeleteBtn').data('phone', phone);
        $('#confirmModal, #confirmModalOverlay').addClass('open');
      });
    }

    // Accountant modal save
    $('#accModalSaveBtn').off('click').on('click', function() {
      var firstName = $('#accModalFirstName').val().trim();
      var lastName = $('#accModalLastName').val().trim();
      var email = $('#accModalEmail').val().trim();
      var phone = $('#accModalPhone').val().trim();

      if (!firstName || !lastName || !email || !phone || phone.length < 9) {
        $('#accModalError').text('Please fill in all fields correctly');
        return;
      }

      $('#accModalError').text('');
      var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');

      if (editingAccPhone) {
        // Update existing
        var existing = accounts[editingAccPhone];
        delete accounts[editingAccPhone];
        accounts[phone] = {
          password: existing.password,
          role: 'accountant',
          firstName: firstName,
          lastName: lastName,
          email: email,
          mustChangePassword: existing.mustChangePassword
        };
      } else {
        // Add new
        if (accounts[phone]) {
          $('#accModalError').text('An account with this phone already exists');
          return;
        }
        accounts[phone] = {
          password: lastName.toLowerCase().trim() + '123',
          role: 'accountant',
          firstName: firstName,
          lastName: lastName,
          email: email,
          mustChangePassword: true
        };
        alert('Default password: ' + lastName.toLowerCase().trim() + '123');
      }

      localStorage.setItem('staffAccounts', JSON.stringify(accounts));
      $('#accountantModal, #accountantModalOverlay').removeClass('open');
      populateHtAccountants();
    });

    // Confirm delete
    $('#confirmDeleteBtn').off('click').on('click', function() {
      var phone = $(this).data('phone');
      var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
      delete accounts[phone];
      localStorage.setItem('staffAccounts', JSON.stringify(accounts));
      $('#confirmModal, #confirmModalOverlay').removeClass('open');
      populateHtAccountants();
    });

    function populateHtTransactions() {
      renderHtTransactions();
      $('#txnFilterFrom, #txnFilterTo').val('');
      $('#txnFilterApply').off('click').on('click', function() { renderHtTransactions(true); });
      $('#txnFilterReset').off('click').on('click', function() {
        $('#txnFilterFrom, #txnFilterTo').val('');
        renderHtTransactions(false);
      });
    }

    function renderHtTransactions(filter) {
      var txns = JSON.parse(localStorage.getItem('transactions') || '[]');
      if (filter) {
        var from = $('#txnFilterFrom').val();
        var to = $('#txnFilterTo').val();
        if (from) txns = txns.filter(function(t) { return t.date >= from; });
        if (to) txns = txns.filter(function(t) { return t.date <= to; });
      }
      var html = '';
      txns.reverse().forEach(function(t) {
        html += '<tr><td>' + t.id + '</td><td>' + t.student + '</td><td>' + t.level + '</td><td>' + fmtMoney(t.amount) + '</td><td>' + methodIcon(t.method) + '</td><td>' + fmtDate(t.date) + '</td><td>' + statusBadge(t.status) + '</td></tr>';
      });
      $('#transactionTable').html(html);
    }

    function populateHtStudents() {
      renderHtStudents();
      $('#studentFilterFrom, #studentFilterTo').val('');
      $('#studentFilterTerm').val('all');
      $('#studentFilterApply').off('click').on('click', function() { renderHtStudents(true); });
      $('#studentFilterReset').off('click').on('click', function() {
        $('#studentFilterFrom, #studentFilterTo').val('');
        $('#studentFilterTerm').val('all');
        renderHtStudents(false);
      });
      $('#exportPdfBtn').off('click').on('click', function() {
        window.print();
      });
    }

    function renderHtStudents(filter) {
      var students = JSON.parse(localStorage.getItem('students') || '[]');
      if (filter) {
        var from = $('#studentFilterFrom').val();
        var to = $('#studentFilterTo').val();
        var term = $('#studentFilterTerm').val();
        if (from) students = students.filter(function(s) { return s.date >= from; });
        if (to) students = students.filter(function(s) { return s.date <= to; });
        if (term && term !== 'all') students = students.filter(function(s) { return s.term === term; });
      }
      var html = '';
      students.forEach(function(s) {
        html += '<tr><td>' + s.name + '</td><td>' + s.level + '</td><td>+265 ' + s.phone + '</td><td>' + fmtMoney(s.amount) + '</td><td>' + fmtDate(s.date) + '</td><td>' + s.term + '</td></tr>';
      });
      $('#studentTable').html(html);
    }

    function populateHtProfile() {
      var user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      $('#profileFirstName').val(user.firstName || '');
      $('#profileLastName').val(user.lastName || '');
      $('#profileEmail').val(user.email || '');
      $('#profilePhone').val(user.phone || '');
      $('#profileError').text('');
      $('#profilePasswordError').text('');

      $('#profileSaveBtn').off('click').on('click', function() {
        var firstName = $('#profileFirstName').val().trim();
        var lastName = $('#profileLastName').val().trim();
        var email = $('#profileEmail').val().trim();
        var phone = $('#profilePhone').val().trim();

        if (!firstName || !lastName || !email || !phone || phone.length < 9) {
          $('#profileError').text('Please fill in all fields correctly');
          return;
        }
        $('#profileError').text('');
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Also update staffAccounts
        var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
        if (accounts[user.phone]) {
          accounts[user.phone].firstName = firstName;
          accounts[user.phone].lastName = lastName;
          accounts[user.phone].email = email;
          localStorage.setItem('staffAccounts', JSON.stringify(accounts));
        }

        alert('Profile updated!');
      });

      $('#profileChangePasswordBtn').off('click').on('click', function() {
        var current = $('#profileCurrentPassword').val();
        var newPass = $('#profileNewPassword').val();
        var confirm = $('#profileConfirmPassword').val();

        if (!current) { $('#profilePasswordError').text('Please enter current password'); return; }
        if (!newPass || newPass.length < 6) { $('#profilePasswordError').text('New password must be at least 6 characters'); return; }
        if (newPass !== confirm) { $('#profilePasswordError').text('Passwords do not match'); return; }

        $('#profilePasswordError').text('');
        var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
        if (accounts[user.phone]) {
          if (accounts[user.phone].password !== current) {
            $('#profilePasswordError').text('Current password is incorrect');
            return;
          }
          accounts[user.phone].password = newPass;
          accounts[user.phone].mustChangePassword = false;
          localStorage.setItem('staffAccounts', JSON.stringify(accounts));
          alert('Password changed!');
          $('#profileCurrentPassword, #profileNewPassword, #profileConfirmPassword').val('');
        }
      });
    }

    // ════════════════════════════════════════════════
    //  ACCOUNTANT PANELS
    // ════════════════════════════════════════════════

    function populateAcDashboard() {
      var user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      var school = JSON.parse(localStorage.getItem('schoolInfo') || '{}');
      var txns = JSON.parse(localStorage.getItem('transactions') || '[]');

      $('#acWelcomeName').text((user.firstName || '') + ' ' + (user.lastName || ''));
      $('#acSchoolName').text(school.name || '—');
      $('#acSchoolLocation').text(school.location || '—');

      var today = new Date();
      var todayStr = today.toISOString().split('T')[0];
      var monthStr = todayStr.substring(0, 7);

      var todayTxns = txns.filter(function(t) { return t.date === todayStr; });
      var monthTxns = txns.filter(function(t) { return t.date.indexOf(monthStr) === 0; });

      var todayTotal = 0;
      todayTxns.forEach(function(t) { todayTotal += t.amount; });
      var monthTotal = 0;
      monthTxns.forEach(function(t) { monthTotal += t.amount; });
      var pendingCount = txns.filter(function(t) { return t.status === 'Pending' || t.status === 'Partial'; }).length;

      $('#acStatToday').text(fmtMoney(todayTotal));
      $('#acStatTxnCount').text(todayTxns.length);
      $('#acStatPending').text(pendingCount);
      $('#acStatMonthly').text(fmtMoney(monthTotal));

      // Outstanding balances — mock some
      var outstanding = [
        { name: "John Katengeza", level: "Form 3", owes: 60000 },
        { name: "Tiwanike Mvula", level: "Form 2", owes: 95000 },
        { name: "Chisomo Nkhwazi", level: "Form 1", owes: 30000 },
        { name: "Annifer Phiri", level: "Form 4", owes: 120000 }
      ];
      var ohtml = '';
      outstanding.forEach(function(o) {
        var initials = o.name.split(' ').map(function(w) { return w[0]; }).join('');
        ohtml += '<div class="outstanding-item"><div class="outstanding-avatar">' + initials + '</div><div class="outstanding-info"><strong>' + o.name + '</strong><small>' + o.level + ' — Owes MWK ' + Number(o.owes).toLocaleString() + '</small></div><span class="badge badge-failed">Overdue</span></div>';
      });
      $('#acOutstandingList').html(ohtml);

      // Weekly chart
      var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var dayTotals = [0,0,0,0,0,0,0];
      // Get current week's transactions
      var weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      var weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      txns.forEach(function(t) {
        var d = new Date(t.date);
        if (d >= weekStart && d <= weekEnd) {
          var dayIdx = d.getDay();
          dayTotals[dayIdx] += t.amount;
        }
      });

      var maxDay = Math.max.apply(null, dayTotals) || 1;
      $('#acChartBars .chart-bar').each(function(i) {
        var pct = (dayTotals[i] / maxDay) * 100;
        $(this).css('height', Math.max(4, pct) + '%');
      });
    }

    function populateAcTransactions() {
      renderAcTransactions();
      $('#acTxnFilterFrom, #acTxnFilterTo').val('');
      $('#acTxnFilterMethod').val('all');
      $('#acTxnFilterApply').off('click').on('click', function() { renderAcTransactions(true); });
      $('#acTxnFilterReset').off('click').on('click', function() {
        $('#acTxnFilterFrom, #acTxnFilterTo').val('');
        $('#acTxnFilterMethod').val('all');
        renderAcTransactions(false);
      });
    }

    function renderAcTransactions(filter) {
      var txns = JSON.parse(localStorage.getItem('transactions') || '[]');
      if (filter) {
        var from = $('#acTxnFilterFrom').val();
        var to = $('#acTxnFilterTo').val();
        var method = $('#acTxnFilterMethod').val();
        if (from) txns = txns.filter(function(t) { return t.date >= from; });
        if (to) txns = txns.filter(function(t) { return t.date <= to; });
        if (method && method !== 'all') txns = txns.filter(function(t) { return t.method === method; });
      }
      var html = '';
      txns.reverse().forEach(function(t) {
        html += '<tr><td>' + t.id + '</td><td>' + t.student + '</td><td>' + t.level + '</td><td>' + fmtMoney(t.amount) + '</td><td>' + methodIcon(t.method) + '</td><td>' + fmtDate(t.date) + '</td><td>' + statusBadge(t.status) + '</td></tr>';
      });
      $('#acTransactionTable').html(html);
    }

    function populateAcStudents() {
      renderAcStudents();
      $('#acStudentFilterFrom, #acStudentFilterTo').val('');
      $('#acStudentFilterTerm').val('all');
      $('#acStudentFilterApply').off('click').on('click', function() { renderAcStudents(true); });
      $('#acStudentFilterReset').off('click').on('click', function() {
        $('#acStudentFilterFrom, #acStudentFilterTo').val('');
        $('#acStudentFilterTerm').val('all');
        renderAcStudents(false);
      });
      $('#acExportPdfBtn').off('click').on('click', function() {
        window.print();
      });
    }

    function renderAcStudents(filter) {
      var students = JSON.parse(localStorage.getItem('students') || '[]');
      if (filter) {
        var from = $('#acStudentFilterFrom').val();
        var to = $('#acStudentFilterTo').val();
        var term = $('#acStudentFilterTerm').val();
        if (from) students = students.filter(function(s) { return s.date >= from; });
        if (to) students = students.filter(function(s) { return s.date <= to; });
        if (term && term !== 'all') students = students.filter(function(s) { return s.term === term; });
      }
      var html = '';
      students.forEach(function(s) {
        html += '<tr><td>' + s.name + '</td><td>' + s.level + '</td><td>+265 ' + s.phone + '</td><td>' + fmtMoney(s.amount) + '</td><td>' + fmtDate(s.date) + '</td><td>' + s.term + '</td></tr>';
      });
      $('#acStudentTable').html(html);
    }

    function populateAcProfile() {
      var user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      $('#acProfileFirstName').val(user.firstName || '');
      $('#acProfileLastName').val(user.lastName || '');
      $('#acProfileEmail').val(user.email || '');
      $('#acProfilePhone').val(user.phone || '');
      $('#acProfileError').text('');
      $('#acProfilePasswordError').text('');

      $('#acProfileSaveBtn').off('click').on('click', function() {
        var firstName = $('#acProfileFirstName').val().trim();
        var lastName = $('#acProfileLastName').val().trim();
        var email = $('#acProfileEmail').val().trim();
        var phone = $('#acProfilePhone').val().trim();

        if (!firstName || !lastName || !email || !phone || phone.length < 9) {
          $('#acProfileError').text('Please fill in all fields correctly');
          return;
        }
        $('#acProfileError').text('');
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;
        localStorage.setItem('currentUser', JSON.stringify(user));

        var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
        if (accounts[user.phone]) {
          accounts[user.phone].firstName = firstName;
          accounts[user.phone].lastName = lastName;
          accounts[user.phone].email = email;
          localStorage.setItem('staffAccounts', JSON.stringify(accounts));
        }
        alert('Profile updated!');
      });

      $('#acProfileChangePasswordBtn').off('click').on('click', function() {
        var current = $('#acProfileCurrentPassword').val();
        var newPass = $('#acProfileNewPassword').val();
        var confirm = $('#acProfileConfirmPassword').val();

        if (!current) { $('#acProfilePasswordError').text('Please enter current password'); return; }
        if (!newPass || newPass.length < 6) { $('#acProfilePasswordError').text('New password must be at least 6 characters'); return; }
        if (newPass !== confirm) { $('#acProfilePasswordError').text('Passwords do not match'); return; }

        $('#acProfilePasswordError').text('');
        var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
        if (accounts[user.phone]) {
          if (accounts[user.phone].password !== current) {
            $('#acProfilePasswordError').text('Current password is incorrect');
            return;
          }
          accounts[user.phone].password = newPass;
          accounts[user.phone].mustChangePassword = false;
          localStorage.setItem('staffAccounts', JSON.stringify(accounts));
          alert('Password changed!');
          $('#acProfileCurrentPassword, #acProfileNewPassword, #acProfileConfirmPassword').val('');
        }
      });
    }
  }

});
