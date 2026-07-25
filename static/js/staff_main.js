$(document).ready(function () {

  if (!$('#panel-dashboard').length) return;

  var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  var role = currentUser.role === 'accountant' ? 'ac' : 'ht';
  var tabLoaded = {};

  // ── Seed data ─────────────────────────────────────
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

  // ── Helpers ────────────────────────────────────────
  window.fmtMoney = function (amount) {
    return 'MWK ' + Number(amount).toLocaleString();
  };

  window.fmtDate = function (d) {
    var parts = d.split('-');
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
  };

  window.statusBadge = function (status) {
    if (status === 'Paid' || status === 'Active' || status === 'Verified') return '<span class="badge badge-success">' + status + '</span>';
    if (status === 'Partial' || status === 'Pending') return '<span class="badge badge-pending">' + status + '</span>';
    return '<span class="badge badge-failed">' + status + '</span>';
  };

  window.methodIcon = function (method) {
    if (method === 'Airtel Money') return '<i class="fa-solid fa-mobile-screen-button method-icon-airtel"></i> Airtel';
    if (method === 'TNM Mpamba') return '<i class="fa-solid fa-mobile-screen-button method-icon-tnm"></i> TNM';
    if (method === 'National Bank') return '<i class="fa-solid fa-building-columns method-icon-bank"></i> NB';
    return method;
  };

  // ── Router ─────────────────────────────────────────
  window.loadTab = function (key) {
    $('.dashboard-panel').hide();
    $('#panel-' + key).show();
    $('.sidebar-item').removeClass('active');
    $('.sidebar-item[data-tab="' + key + '"]').addClass('active');

    if (tabLoaded[key]) return;
    tabLoaded[key] = true;

    $.get('/static/' + role + '_content/' + key + '.html', function (html) {
      $('#panel-' + key).append(html);
    });
  };

  // Check if accountant must change password
  if (role === 'ac' && currentUser.phone) {
    var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
    if (accounts[currentUser.phone] && accounts[currentUser.phone].mustChangePassword) {
      location.hash = 'profile';
    }
  }

  // ── Sidebar clicks ─────────────────────────────────
  $('.sidebar-nav').on('click', '.sidebar-item', function (e) {
    e.preventDefault();
    var tab = $(this).data('tab');
    location.hash = tab;
    history.pushState({ tab: tab }, '', '#' + tab);
  });

  $(window).on('hashchange', function () {
    var key = location.hash.replace('#', '') || 'dashboard';
    loadTab(key);
  });

  window.onpopstate = function (e) {
    if (e.state) loadTab(e.state.tab);
  };

  // ── Initial load ───────────────────────────────────
  var initial = location.hash.replace('#', '') || 'dashboard';
  loadTab(initial);

  // ── Logout ─────────────────────────────────────────
  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  });

  // ── Modal Close ────────────────────────────────────
  $(document).on('click', '.modal-close-btn, .modal-overlay', function () {
    $('.modal-overlay, .modal').removeClass('open');
  });

  // ── Accountant Modal Save (headteacher only) ──────
  if ($('#accModalSaveBtn').length) {
    var editingAccPhone = null;

    $('#accModalSaveBtn').on('click', function () {
      var fn = $('#accModalFirstName').val().trim();
      var ln = $('#accModalLastName').val().trim();
      var em = $('#accModalEmail').val().trim();
      var ph = $('#accModalPhone').val().trim();

      if (!fn || !ln || !em || !ph || ph.length < 9) {
        $('#accModalError').text('Please fill in all fields correctly');
        return;
      }
      $('#accModalError').text('');

      var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');

      if (editingAccPhone) {
        var existing = accounts[editingAccPhone];
        delete accounts[editingAccPhone];
        accounts[ph] = {
          password: existing.password,
          role: 'accountant',
          firstName: fn,
          lastName: ln,
          email: em,
          mustChangePassword: existing.mustChangePassword
        };
      } else {
        if (accounts[ph]) {
          $('#accModalError').text('An account with this phone already exists');
          return;
        }
        accounts[ph] = {
          password: ln.toLowerCase().trim() + '123',
          role: 'accountant',
          firstName: fn,
          lastName: ln,
          email: em,
          mustChangePassword: true
        };
        alert('Default password: ' + ln.toLowerCase().trim() + '123');
      }

      localStorage.setItem('staffAccounts', JSON.stringify(accounts));
      $('#accountantModal, #accountantModalOverlay').removeClass('open');

      if (typeof window.refreshHtAccountants === 'function') {
        window.refreshHtAccountants();
      }
    });

    $('#confirmDeleteBtn').on('click', function () {
      var phone = $(this).data('phone');
      if (!phone) return;
      var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
      delete accounts[phone];
      localStorage.setItem('staffAccounts', JSON.stringify(accounts));
      $('#confirmModal, #confirmModalOverlay').removeClass('open');

      if (typeof window.refreshHtAccountants === 'function') {
        window.refreshHtAccountants();
      }
    });

    // Open add modal
    $(document).on('click', '#addAccountantBtn', function () {
      editingAccPhone = null;
      $('#accountantModalTitle').text('Add Accountant');
      $('#accModalFirstName, #accModalLastName, #accModalEmail, #accModalPhone').val('');
      $('#accModalError').text('');
      $('#accountantModal, #accountantModalOverlay').addClass('open');
    });

    // Open edit modal
    $(document).on('click', '.acc-edit-btn', function () {
      editingAccPhone = $(this).data('phone');
      var accounts = JSON.parse(localStorage.getItem('staffAccounts') || '{}');
      var a = accounts[editingAccPhone];
      if (!a) return;
      $('#accountantModalTitle').text('Edit Accountant');
      $('#accModalFirstName').val(a.firstName || '');
      $('#accModalLastName').val(a.lastName || '');
      $('#accModalEmail').val(a.email || '');
      $('#accModalPhone').val(editingAccPhone);
      $('#accModalError').text('');
      $('#accountantModal, #accountantModalOverlay').addClass('open');
    });

    // Open delete modal
    $(document).on('click', '.acc-delete-btn', function () {
      var phone = $(this).data('phone');
      var name = $(this).data('name');
      $('#confirmDeleteName').text(name);
      $('#confirmDeleteBtn').data('phone', phone);
      $('#confirmModal, #confirmModalOverlay').addClass('open');
    });
  }

});
