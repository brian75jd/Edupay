window.standardizePhone = function (input) {
  var digits = input.replace(/\D/g, '');
  if (digits.startsWith('265')) digits = digits.slice(3);
  digits = digits.replace(/^0+/, '');
  if (digits.length !== 9) return null;
  return '+265' + digits;
};

const API_ROUTES = {
  login: '/api/auth/login/',
  logout: '/api/auth/logout/',
  me: '/api/auth/me/',
  headteacherSignup: '/user/create_headteacher/',
  changePassword: '/api/auth/change-password/',

 


  schools: '/api/create_school/',
  schoolMine: '/api/schools/mine/',
  schoolById: (id) => `/api/schools/${id}/`,

  accountants: '/api/accountants/',
  accountantById: (id) => `/api/accountants/${id}/`,

  profile: '/api/profile/',

  transactions: '/api/transactions/',
  students: '/api/students/',

  dashboardHt: '/api/dashboard/headteacher/',
  dashboardAc: '/api/dashboard/accountant/',

  parentLogin: '/user/v1/user_login/',
  parentCreateAccount: '/user/v1/create_user_account/',

  paymentInitiate: '/payment/v1/initiate_payment/',
};

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};


document.addEventListener('DOMContentLoaded',async ()=>{
  try {
    const response = await fetch(API_ROUTES.transactions,{
      method:"GET"
    })

    data = await response.json();
    console.log(data)
    
  } catch (error) {
    console.warn(error)
  }
})


const apiFetch = async (path, { method = 'GET', body } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (method !== 'GET') headers['X-CSRFToken'] = getCookie('csrftoken');

  const res = await fetch(path, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch {  }

  if (!res.ok) {
    var message = data?.detail || data?.error || data?.message || null;
    if (!message && data && typeof data === 'object') {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        var val = data[keys[i]];
        if (Array.isArray(val) && val.length) { message = val[0]; break; }
        if (typeof val === 'string') { message = val; break; }
      }
    }
    throw new Error(message || 'Something went wrong. Please try again.');
  }
  return data;
};


const byId = (id) => document.getElementById(id);
const qs = (sel, root = document) => root.querySelector(sel);
const qsAll = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const on = (el, evt, handler) => el?.addEventListener(evt, handler);
const setText = (el, value) => { if (el) el.textContent = value; };
const getVal = (el) => el?.value ?? '';
const setVal = (el, v) => { if (el) el.value = v; };
const show = (el) => { if (el) el.style.display = ''; };
const hide = (el) => { if (el) el.style.display = 'none'; };
const addClassAll = (sel, cls) => qsAll(sel).forEach((el) => el.classList.add(cls));
const removeClassAll = (sel, cls) => qsAll(sel).forEach((el) => el.classList.remove(cls));

const fmtMoney = (amount) => `MWK ${Number(amount).toLocaleString()}`;
const fmtDate = (d) => {
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
};
const statusBadge = (status) => {
  if (['Paid', 'Active', 'Verified'].includes(status)) return `<span class="badge badge-success">${status}</span>`;
  if (['Partial', 'Pending'].includes(status)) return `<span class="badge badge-pending">${status}</span>`;
  return `<span class="badge badge-failed">${status}</span>`;
};
const methodIcon = (method) => {
  if (method === 'Airtel Money') return '<i class="fa-solid fa-mobile-screen-button method-icon-airtel"></i> Airtel';
  if (method === 'TNM Mpamba') return '<i class="fa-solid fa-mobile-screen-button method-icon-tnm"></i> TNM';
  if (method === 'National Bank') return '<i class="fa-solid fa-building-columns method-icon-bank"></i> NB';
  return method;
};

document.addEventListener('DOMContentLoaded', () => {
  initGlobalUI();
  initPayFeesFlow();
  initStaffAuthForms();
  initDashboardSpa();
});

function initGlobalUI() {
  on(byId('sidebarToggle'), 'click', () => {
    addClassAll('#sidebar, #sidebarOverlay', 'open');
    document.body.classList.add('sidebar-open');
  });
  on(byId('sidebarOverlay'), 'click', () => {
    removeClassAll('#sidebar, #sidebarOverlay', 'open');
    document.body.classList.remove('sidebar-open');
  });
  qsAll('.sidebar-item').forEach((el) => on(el, 'click', () => {
    removeClassAll('#sidebar, #sidebarOverlay', 'open');
    document.body.classList.remove('sidebar-open');
  }));

  on(byId('navToggle'), 'click', () => byId('navLinks')?.classList.toggle('open'));
  qsAll('#navLinks a').forEach((a) => on(a, 'click', () => byId('navLinks')?.classList.remove('open')));


  on(byId('schoolSearch'), 'keyup', function () {
    const value = this.value.toLowerCase();
    qsAll('#schoolList .school-list-item').forEach((item) => {
      const name = qs('.school-card-name', item)?.textContent.toLowerCase() ?? '';
      const location = qs('.school-card-location', item)?.textContent.toLowerCase() ?? '';
      item.style.display = (name.includes(value) || location.includes(value)) ? '' : 'none';
    });
  });

  qsAll('.bottom-nav-item').forEach((item) => on(item, 'click', (e) => {
    e.preventDefault();
    removeClassAll('.bottom-nav-item', 'active');
    item.classList.add('active');
  }));

  qsAll('.password-toggle').forEach((toggle) => on(toggle, 'click', () => {
    const input = byId(toggle.dataset.target);
    const icon = qs('i', toggle);
    if (!input) return;
    const showing = input.getAttribute('type') === 'password';
    input.setAttribute('type', showing ? 'text' : 'password');
    icon?.classList.toggle('fa-eye', !showing);
    icon?.classList.toggle('fa-eye-slash', showing);
  }));

  qsAll('.auth-phone-input').forEach((input) => on(input, 'input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  }));
}


function initPayFeesFlow() {

  qsAll('.pay-fees-btn').forEach((btn) => on(btn, 'click', (e) => {
    e.preventDefault();
    const schoolId = btn.dataset.schoolId; 
    window.location.href = `/pay-fees/?school=${encodeURIComponent(schoolId)}`;
  }));

  if (!byId('schoolName')) return;

  (async () => {
    const params = new URLSearchParams(window.location.search);
    const schoolId = params.get('school');
    if (!schoolId) return;

    try {
      const school = await apiFetch(API_ROUTES.schoolById(schoolId));
      setText(byId('schoolName'), school.name);
      setText(byId('schoolLocation'), school.location);
      setText(byId('schoolType'), school.type);
      const logo = byId('schoolLogo');
      if (logo) { logo.setAttribute('src', school.logo); logo.setAttribute('alt', school.name); }
      setText(byId('totalFees'), fmtMoney(school.amount));
      setText(byId('feesBalance'), fmtMoney(school.amount));
      setText(byId('confirmSchool'), school.name);
    } catch (err) {
      console.error('Failed to load school:', err.message);
    }
  })();

  let parentPhone = '';
  const selectedSchoolId = new URLSearchParams(window.location.search).get('school');

  const goToStep = (step) => {
    qsAll('.step-panel').forEach((p) => p.classList.add('step-panel-hidden'));
    byId(`step${step}Panel`)?.classList.remove('step-panel-hidden');
    removeClassAll('.step-item', 'active');
    removeClassAll('.step-item', 'completed');
    for (let i = 1; i <= 3; i++) {
      const item = qs(`.step-item[data-step="${i}"]`);
      if (!item) continue;
      if (i === step) item.classList.add('active');
      else if (i < step) item.classList.add('completed');
    }
  };

 
  let authMode = 'login';

  const setAuthMode = (mode) => {
    authMode = mode;
    const loginBtn = byId('authModeLoginBtn');
    const signupBtn = byId('authModeSignupBtn');
    loginBtn?.classList.toggle('btn-primary', mode === 'login');
    loginBtn?.classList.toggle('btn-outline', mode !== 'login');
    signupBtn?.classList.toggle('btn-primary', mode === 'signup');
    signupBtn?.classList.toggle('btn-outline', mode !== 'signup');
    setText(byId('authStepDesc'), mode === 'login'
      ? 'Enter your phone number and PIN to continue'
      : 'Enter a phone number and PIN to create your account');
    setText(byId('phoneError'), '');
  };

  on(byId('authModeLoginBtn'), 'click', () => setAuthMode('login'));
  on(byId('authModeSignupBtn'), 'click', () => setAuthMode('signup'));

  on(byId('parentAuthContinue'), 'click', async () => {
    const phone = getVal(byId('parentPhone')).trim();
    const pin = getVal(byId('parentPIN')).trim();
    parentPhone = phone;

    if (!phone || phone.length < 9) {
      return setText(byId('phoneError'), 'Please enter a valid phone number (9 digits)');
    }
    if (!pin || pin.length < 4) {
      return setText(byId('phoneError'), 'Please enter a valid PIN (at least 4 digits)');
    }
    setText(byId('phoneError'), '');

    const endpoint = authMode === 'login' ? API_ROUTES.parentLogin : API_ROUTES.parentCreateAccount;

    try {
      // Login verifies phone_number + PIN server-side; Create Account
      // registers a new parent record with them. Either way, success
      // moves on to the student details step.
      await apiFetch(endpoint, { method: 'POST', body: { phone_number: phone, pin } });
      setText(byId('phoneError'), '');
      goToStep(2);
    } catch (err) {
      setText(byId('phoneError'), err.message);
    }
  });

  // ── Step 2: Student details + amount ────────────────
  on(byId('step2Next'), 'click', () => {
    const firstName = getVal(byId('studentFirstName')).trim();
    const lastName = getVal(byId('studentLastName')).trim();
    const level = getVal(byId('studentLevel'));
    const amount = getVal(byId('feeAmount')).trim();

    if (!firstName) return setText(byId('step2Error'), 'Please enter the student first name');
    if (!lastName) return setText(byId('step2Error'), 'Please enter the student last name');
    if (!level) return setText(byId('step2Error'), 'Please select the level of study');
    if (!amount || Number(amount) <= 0) return setText(byId('step2Error'), 'Please enter a valid amount');
    setText(byId('step2Error'), '');

    const levelSelect = byId('studentLevel');
    const selectedOption = levelSelect?.options[levelSelect.selectedIndex];
    setText(byId('confirmStudent'), `${firstName} ${lastName}`);
    setText(byId('confirmLevel'), selectedOption?.text ?? '');
    setText(byId('confirmPhone'), `+265 ${parentPhone}`);
    setText(byId('confirmTotal'), fmtMoney(amount));
    goToStep(3);
  });

  // ── Step 3: Confirm & Pay ───────────────────────────
  on(byId('makePaymentBtn'), 'click', async () => {
    const btn = byId('makePaymentBtn');
    btn.disabled = true;
    try {
      const result = await apiFetch(API_ROUTES.paymentInitiate, {
        method: 'POST',
        body: {
          school: selectedSchoolId,
          student_first_name: window.toTitleCase(getVal(byId('studentFirstName')).trim()),
          student_last_name: window.toTitleCase(getVal(byId('studentLastName')).trim()),
          grade: getVal(byId('studentLevel')),
          amount: getVal(byId('feeAmount')).trim(),
          phone_number: parentPhone,
          school_id: 1
        },
      });
      if (result?.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        alert('Payment could not be started. Please try again.');
        btn.disabled = false;
      }
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
      btn.disabled = false;
    }
  });
}


function initStaffAuthForms() {
  on(byId('loginForm'), 'submit', async (e) => {
    e.preventDefault();
    const phone = window.standardizePhone(getVal(byId('loginPhone')));
    const password = getVal(byId('loginPassword'));

    if (!phone) return setText(byId('loginError'), 'Enter a valid phone number');
    if (!password || password.length < 6) return setText(byId('loginError'), 'Password must be at least 6 characters');

    try {
      const { role } = await apiFetch(API_ROUTES.login, { method: 'POST', body: { phone, password } });
      try {
        var me = await apiFetch(API_ROUTES.me);
        if (window.EDUPAY) window.EDUPAY.safeAssign('user', me);
      } catch (_) {}
      setText(byId('loginError'), '');
      window.location.href = role === 'headteacher' ? '/school/headteacher/' : '/school/accountant/';
    } catch (err) {
      setText(byId('loginError'), err.message);
    }
  });

  on(byId('headteacherSignupForm'), 'submit', async (e) => {
    e.preventDefault();
    const firstName = window.toTitleCase(getVal(byId('htFirstName')).trim());
    const lastName = window.toTitleCase(getVal(byId('htLastName')).trim());
    const email = getVal(byId('htEmail')).trim();
    const phone = window.standardizePhone(getVal(byId('htPhone')));
    const password = getVal(byId('htPassword'));
    const confirm = getVal(byId('htConfirmPassword'));

    if (!firstName || !lastName || !email) return setText(byId('htSignupError'), 'Please fill in all fields');
    if (!phone) return setText(byId('htSignupError'), 'Enter a valid phone number');
    if (!password || password.length < 6) return setText(byId('htSignupError'), 'Password must be at least 6 characters');
    if (password !== confirm) return setText(byId('htSignupError'), 'Passwords do not match');

    try {
      
      await apiFetch(API_ROUTES.headteacherSignup, {
        method: 'POST',
        body: { 
          first_name:firstName, last_name:lastName, 
          email:email, phone_number:phone, 
          password1:password 
        },
      });
      setText(byId('htSignupError'), '');
      window.location.href = '/school/create/';
    } catch (err) {
      setText(byId('htSignupError'), err.message);
    }
  });

  on(byId('createSchoolForm'), 'submit', async (e) => {
    e.preventDefault();
    console.log('Running again')
    const name = window.toTitleCase(getVal(byId('schoolName')).trim());
    const location = window.toTitleCase(getVal(byId('schoolLocation')).trim());
    const type = getVal(byId('schoolType'));

    if (!name) return setText(byId('createSchoolError'), 'Please enter the school name');
    if (!location) return setText(byId('createSchoolError'), 'Please enter the school location');
    if (!type) return setText(byId('createSchoolError'), 'Please select the school type');

    try {
      await apiFetch(API_ROUTES.schools, { method: 'POST', body: { name, location, type } });
      setText(byId('createSchoolError'), '');
      window.location.href = '/school/headteacher/';
    } catch (err) {
      setText(byId('createSchoolError'), err.message);
    }
  });

  on(byId('addAccountantForm'), 'submit', async (e) => {
    e.preventDefault();
    const firstName = window.toTitleCase(getVal(byId('accFirstName')).trim());
    const lastName = window.toTitleCase(getVal(byId('accLastName')).trim());
    const email = getVal(byId('accEmail')).trim();
    const phone = getVal(byId('accPhone')).trim();

    if (!firstName || !lastName || !email) return setText(byId('addAccountantError'), 'Please fill in all fields');
    if (!phone || phone.length < 9) return setText(byId('addAccountantError'), 'Please enter a valid phone number');

    try {
      // Server generates the temporary password and sends it via SMS/email —
      // it should never be echoed back to the browser in plaintext.
      await apiFetch(API_ROUTES.accountants, { method: 'POST', body: { firstName, lastName, email, phone } });
      setText(byId('addAccountantError'), '');
      alert('Accountant added! Their login details have been sent to them.');
      window.location.href = '/school/headteacher/';
    } catch (err) {
      setText(byId('addAccountantError'), err.message);
    }
  });

  on(byId('changePasswordForm'), 'submit', async (e) => {
    e.preventDefault();
    const current = getVal(byId('currentPassword'));
    const newPass = getVal(byId('newPassword'));
    const confirm = getVal(byId('confirmNewPassword'));

    if (!current) return setText(byId('changePasswordError'), 'Please enter your current password');
    if (!newPass || newPass.length < 6) return setText(byId('changePasswordError'), 'New password must be at least 6 characters');
    if (newPass !== confirm) return setText(byId('changePasswordError'), 'New passwords do not match');

    try {
      // Server verifies currentPassword against the hash before accepting newPassword.
      await apiFetch(API_ROUTES.changePassword, { method: 'POST', body: { currentPassword: current, newPassword: newPass } });
      alert('Password changed successfully!');
      window.location.href = '/school/accountant/';
    } catch (err) {
      setText(byId('changePasswordError'), err.message);
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD SPA (headteacher + accountant panels)
// ═══════════════════════════════════════════════════════════
function initDashboardSpa() {
  if (!byId('panelContainer')) return;

  let role = null; // 'ht' | 'ac' — resolved from the server, not localStorage
  let currentUser = null;
  const loadedPanels = {};
  let editingAccId = null;

  const loadPanel = async (key) => {
    if (loadedPanels[key]) return showPanel(key, true);

    const res = await fetch(`/static/html/${role}_${key}.html`);
    const html = await res.text();
    byId('panelContainer').innerHTML = html;
    loadedPanels[key] = true;
    showPanel(key, true);
    await populatePanel(key);
  };

  const showPanel = (key, doPopulate) => {
    removeClassAll('.sidebar-item', 'active');
    qs(`.sidebar-item[href="#${key}"]`)?.classList.add('active');
    if (doPopulate && loadedPanels[key]) populatePanel(key);
  };

  const populatePanel = async (key) => {
    const panels = role === 'ht'
      ? { dashboard: populateHtDashboard, school: populateHtSchool, accountants: populateHtAccountants,
          transactions: populateHtTransactions, students: populateHtStudents, profile: populateHtProfile }
      : { dashboard: populateAcDashboard, transactions: populateAcTransactions,
          students: populateAcStudents, profile: populateAcProfile };
    await panels[key]?.();
  };

  // ── HEADTEACHER PANELS ──────────────────────────────
  const populateHtDashboard = async () => {
    const data = await apiFetch(API_ROUTES.dashboardHt);
    setText(byId('htWelcomeName'), `${data.user.firstName} ${data.user.lastName}`);
    setText(byId('htSchoolName'), data.school?.name ?? '—');
    setText(byId('htSchoolLocation'), data.school?.location ?? '—');
    setText(byId('htStatRevenue'), fmtMoney(data.stats.revenue));
    setText(byId('htStatPaid'), data.stats.paidCount);
    setText(byId('htStatPending'), data.stats.pendingCount);
    setText(byId('htStatTotal'), data.stats.totalStudents);

    const html = data.recentTransactions.map((t) => `
      <tr><td>${t.student}</td><td>${t.level}</td><td>${fmtMoney(t.amount)}</td>
      <td>${fmtDate(t.date)}</td><td>${methodIcon(t.method)}</td><td>${statusBadge(t.status)}</td></tr>
    `).join('');
    const el = byId('htRecentTransactions');
    if (el) el.innerHTML = html;
  };

  const populateHtSchool = async () => {
    const school = await apiFetch(API_ROUTES.schoolMine);
    setText(byId('schoolDisplayName'), school.name || 'Not set');
    setText(byId('schoolDisplayLocation'), school.location || 'Not set');
    setText(byId('schoolDisplayType'), school.type || 'Not set');
    setVal(byId('schoolName'), school.name || '');
    setVal(byId('schoolLocation'), school.location || '');
    setVal(byId('schoolType'), school.type || '');
    show(byId('schoolDisplay'));
    hide(byId('schoolEditForm'));
    setText(byId('schoolError'), '');

    on(byId('schoolEditBtn'), 'click', () => { hide(byId('schoolDisplay')); show(byId('schoolEditForm')); });
    on(byId('schoolCancelBtn'), 'click', async () => {
      const s = await apiFetch(API_ROUTES.schoolMine);
      setVal(byId('schoolName'), s.name || '');
      setVal(byId('schoolLocation'), s.location || '');
      setVal(byId('schoolType'), s.type || '');
      show(byId('schoolDisplay'));
      hide(byId('schoolEditForm'));
      setText(byId('schoolError'), '');
    });
    on(byId('schoolSaveBtn'), 'click', async () => {
      const name = window.toTitleCase(getVal(byId('schoolName')).trim());
      const location = window.toTitleCase(getVal(byId('schoolLocation')).trim());
      const type = getVal(byId('schoolType'));
      if (!name || !location || !type) return setText(byId('schoolError'), 'Please fill in all fields');

      try {
        const updated = await apiFetch(API_ROUTES.schoolMine, { method: 'PATCH', body: { name, location, type } });
        setText(byId('schoolError'), '');
        setText(byId('schoolDisplayName'), updated.name);
        setText(byId('schoolDisplayLocation'), updated.location);
        setText(byId('schoolDisplayType'), updated.type);
        show(byId('schoolDisplay'));
        hide(byId('schoolEditForm'));
      } catch (err) {
        setText(byId('schoolError'), err.message);
      }
    });
  };

  const populateHtAccountants = async () => {
    const accountants = await apiFetch(API_ROUTES.accountants);
    const tableEl = byId('accountantTable');
    if (tableEl) {
      tableEl.innerHTML = accountants.map((a) => `
        <tr>
          <td>${a.firstName} ${a.lastName}</td>
          <td>${a.email || '—'}</td>
          <td>+265 ${a.phone}</td>
          <td>${statusBadge(a.status)}</td>
          <td>
            <button class="btn btn-sm btn-outline acc-edit-btn" data-id="${a.id}" style="margin-right:6px;"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-sm btn-outline acc-delete-btn" data-id="${a.id}" data-name="${a.firstName} ${a.lastName}"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }

    on(byId('addAccountantBtn'), 'click', () => {
      editingAccId = null;
      setText(byId('accountantModalTitle'), 'Add Accountant');
      ['accModalFirstName', 'accModalLastName', 'accModalEmail', 'accModalPhone'].forEach((id) => setVal(byId(id), ''));
      setText(byId('accModalError'), '');
      addClassAll('#accountantModal, #accountantModalOverlay', 'open');
    });

    on(tableEl, 'click', (e) => {
      const editBtn = e.target.closest('.acc-edit-btn');
      if (editBtn) {
        editingAccId = editBtn.dataset.id;
        const a = accountants.find((acc) => String(acc.id) === editingAccId);
        setText(byId('accountantModalTitle'), 'Edit Accountant');
        setVal(byId('accModalFirstName'), a?.firstName || '');
        setVal(byId('accModalLastName'), a?.lastName || '');
        setVal(byId('accModalEmail'), a?.email || '');
        setVal(byId('accModalPhone'), a?.phone || '');
        setText(byId('accModalError'), '');
        addClassAll('#accountantModal, #accountantModalOverlay', 'open');
        return;
      }
      const delBtn = e.target.closest('.acc-delete-btn');
      if (delBtn) {
        setText(byId('confirmDeleteName'), delBtn.dataset.name);
        byId('confirmDeleteBtn').dataset.id = delBtn.dataset.id;
        addClassAll('#confirmModal, #confirmModalOverlay', 'open');
      }
    });

    on(byId('accModalSaveBtn'), 'click', async () => {
      const firstName = window.toTitleCase(getVal(byId('accModalFirstName')).trim());
      const lastName = window.toTitleCase(getVal(byId('accModalLastName')).trim());
      const email = getVal(byId('accModalEmail')).trim();
      const phone = getVal(byId('accModalPhone')).trim();

      if (!firstName || !lastName || !email || !phone || phone.length < 9) {
        return setText(byId('accModalError'), 'Please fill in all fields correctly');
      }

      try {
        if (editingAccId) {
          await apiFetch(API_ROUTES.accountantById(editingAccId), { method: 'PATCH', body: { firstName, lastName, email, phone } });
        } else {
          await apiFetch(API_ROUTES.accountants, { method: 'POST', body: { firstName, lastName, email, phone } });
          alert('Accountant added! Their login details have been sent to them.');
        }
        setText(byId('accModalError'), '');
        removeClassAll('#accountantModal, #accountantModalOverlay', 'open');
        await populateHtAccountants();
      } catch (err) {
        setText(byId('accModalError'), err.message);
      }
    });

    on(byId('confirmDeleteBtn'), 'click', async function () {
      try {
        await apiFetch(API_ROUTES.accountantById(this.dataset.id), { method: 'DELETE' });
        removeClassAll('#confirmModal, #confirmModalOverlay', 'open');
        await populateHtAccountants();
      } catch (err) {
        alert(`Couldn't delete accountant: ${err.message}`);
      }
    });
  };

  const renderTransactionsTable = (tableEl, txns) => {
    if (!tableEl) return;
    tableEl.innerHTML = txns.map((t) => `
      <tr><td>${t.id}</td><td>${t.student}</td><td>${t.level}</td><td>${fmtMoney(t.amount)}</td>
      <td>${methodIcon(t.method)}</td><td>${fmtDate(t.date)}</td><td>${statusBadge(t.status)}</td></tr>
    `).join('');
  };

  const renderStudentsTable = (tableEl, students) => {
    if (!tableEl) return;
    tableEl.innerHTML = students.map((s) => `
      <tr><td>${s.name}</td><td>${s.level}</td><td>+265 ${s.phone}</td>
      <td>${fmtMoney(s.amount)}</td><td>${fmtDate(s.date)}</td><td>${s.term}</td></tr>
    `).join('');
  };

  const populateHtTransactions = async () => {
    const load = async () => {
      const params = new URLSearchParams({
        from: getVal(byId('txnFilterFrom')),
        to: getVal(byId('txnFilterTo')),
      });
      const txns = await apiFetch(`${API_ROUTES.transactions}?${params}`);
      renderTransactionsTable(byId('transactionTable'), txns);
    };
    setVal(byId('txnFilterFrom'), '');
    setVal(byId('txnFilterTo'), '');
    on(byId('txnFilterApply'), 'click', load);
    on(byId('txnFilterReset'), 'click', () => {
      setVal(byId('txnFilterFrom'), '');
      setVal(byId('txnFilterTo'), '');
      load();
    });
    await load();
  };

  const populateHtStudents = async () => {
    const load = async () => {
      const params = new URLSearchParams({
        from: getVal(byId('studentFilterFrom')),
        to: getVal(byId('studentFilterTo')),
        term: getVal(byId('studentFilterTerm')) || 'all',
      });
      const students = await apiFetch(`${API_ROUTES.students}?${params}`);
      renderStudentsTable(byId('studentTable'), students);
    };
    setVal(byId('studentFilterFrom'), '');
    setVal(byId('studentFilterTo'), '');
    setVal(byId('studentFilterTerm'), 'all');
    on(byId('studentFilterApply'), 'click', load);
    on(byId('studentFilterReset'), 'click', () => {
      setVal(byId('studentFilterFrom'), '');
      setVal(byId('studentFilterTo'), '');
      setVal(byId('studentFilterTerm'), 'all');
      load();
    });
    on(byId('exportPdfBtn'), 'click', () => window.print());
    await load();
  };

  const populateProfileShared = async (prefix) => {
    const user = await apiFetch(API_ROUTES.profile);
    setVal(byId(`${prefix}FirstName`), user.firstName || '');
    setVal(byId(`${prefix}LastName`), user.lastName || '');
    setVal(byId(`${prefix}Email`), user.email || '');
    setVal(byId(`${prefix}Phone`), user.phone || '');
    setText(byId(`${prefix}Error`), '');
    setText(byId(`${prefix}PasswordError`), '');

    on(byId(`${prefix}SaveBtn`), 'click', async () => {
      const firstName = window.toTitleCase(getVal(byId(`${prefix}FirstName`)).trim());
      const lastName = window.toTitleCase(getVal(byId(`${prefix}LastName`)).trim());
      const email = getVal(byId(`${prefix}Email`)).trim();
      const phone = getVal(byId(`${prefix}Phone`)).trim();
      if (!firstName || !lastName || !email || !phone || phone.length < 9) {
        return setText(byId(`${prefix}Error`), 'Please fill in all fields correctly');
      }
      try {
        await apiFetch(API_ROUTES.profile, { method: 'PATCH', body: { firstName, lastName, email, phone } });
        setText(byId(`${prefix}Error`), '');
        alert('Profile updated!');
      } catch (err) {
        setText(byId(`${prefix}Error`), err.message);
      }
    });

    on(byId(`${prefix}ChangePasswordBtn`), 'click', async () => {
      const current = getVal(byId(`${prefix}CurrentPassword`));
      const newPass = getVal(byId(`${prefix}NewPassword`));
      const confirm = getVal(byId(`${prefix}ConfirmPassword`));
      if (!current) return setText(byId(`${prefix}PasswordError`), 'Please enter current password');
      if (!newPass || newPass.length < 6) return setText(byId(`${prefix}PasswordError`), 'New password must be at least 6 characters');
      if (newPass !== confirm) return setText(byId(`${prefix}PasswordError`), 'Passwords do not match');

      try {
        await apiFetch(API_ROUTES.changePassword, { method: 'POST', body: { currentPassword: current, newPassword: newPass } });
        setText(byId(`${prefix}PasswordError`), '');
        alert('Password changed!');
        [`${prefix}CurrentPassword`, `${prefix}NewPassword`, `${prefix}ConfirmPassword`].forEach((id) => setVal(byId(id), ''));
      } catch (err) {
        setText(byId(`${prefix}PasswordError`), err.message);
      }
    });
  };

  const populateHtProfile = () => populateProfileShared('profile');

  // ── ACCOUNTANT PANELS ───────────────────────────────
  const populateAcDashboard = async () => {
    const data = await apiFetch(API_ROUTES.dashboardAc);
    setText(byId('acWelcomeName'), `${data.user.firstName} ${data.user.lastName}`);
    setText(byId('acSchoolName'), data.school?.name ?? '—');
    setText(byId('acSchoolLocation'), data.school?.location ?? '—');
    setText(byId('acStatToday'), fmtMoney(data.stats.todayTotal));
    setText(byId('acStatTxnCount'), data.stats.todayCount);
    setText(byId('acStatPending'), data.stats.pendingCount);
    setText(byId('acStatMonthly'), fmtMoney(data.stats.monthTotal));

    const outstandingEl = byId('acOutstandingList');
    if (outstandingEl) {
      outstandingEl.innerHTML = data.outstanding.map((o) => {
        const initials = o.name.split(' ').map((w) => w[0]).join('');
        return `<div class="outstanding-item"><div class="outstanding-avatar">${initials}</div>
          <div class="outstanding-info"><strong>${o.name}</strong>
          <small>${o.level} — Owes ${fmtMoney(o.owes)}</small></div>
          <span class="badge badge-failed">Overdue</span></div>`;
      }).join('');
    }

    const maxDay = Math.max(...data.weeklyChart, 1);
    qsAll('#acChartBars .chart-bar').forEach((bar, i) => {
      const pct = (data.weeklyChart[i] / maxDay) * 100;
      bar.style.height = `${Math.max(4, pct)}%`;
    });
  };

  const populateAcTransactions = async () => {
    const load = async () => {
      const params = new URLSearchParams({
        from: getVal(byId('acTxnFilterFrom')),
        to: getVal(byId('acTxnFilterTo')),
        method: getVal(byId('acTxnFilterMethod')) || 'all',
      });
      const txns = await apiFetch(`${API_ROUTES.transactions}?${params}`);
      renderTransactionsTable(byId('acTransactionTable'), txns);
    };
    setVal(byId('acTxnFilterFrom'), '');
    setVal(byId('acTxnFilterTo'), '');
    setVal(byId('acTxnFilterMethod'), 'all');
    on(byId('acTxnFilterApply'), 'click', load);
    on(byId('acTxnFilterReset'), 'click', () => {
      setVal(byId('acTxnFilterFrom'), '');
      setVal(byId('acTxnFilterTo'), '');
      setVal(byId('acTxnFilterMethod'), 'all');
      load();
    });
    await load();
  };

  const populateAcStudents = async () => {
    const load = async () => {
      const params = new URLSearchParams({
        from: getVal(byId('acStudentFilterFrom')),
        to: getVal(byId('acStudentFilterTo')),
        term: getVal(byId('acStudentFilterTerm')) || 'all',
      });
      const students = await apiFetch(`${API_ROUTES.students}?${params}`);
      renderStudentsTable(byId('acStudentTable'), students);
    };
    setVal(byId('acStudentFilterFrom'), '');
    setVal(byId('acStudentFilterTo'), '');
    setVal(byId('acStudentFilterTerm'), 'all');
    on(byId('acStudentFilterApply'), 'click', load);
    on(byId('acStudentFilterReset'), 'click', () => {
      setVal(byId('acStudentFilterFrom'), '');
      setVal(byId('acStudentFilterTo'), '');
      setVal(byId('acStudentFilterTerm'), 'all');
      load();
    });
    on(byId('acExportPdfBtn'), 'click', () => window.print());
    await load();
  };

  const populateAcProfile = () => populateProfileShared('acProfile');

  // ── Router + init ───────────────────────────────────
  (async () => {
    try {
      // Ask the server who's logged in and what role they have —
      // no more reading a role out of localStorage.
      currentUser = await apiFetch(API_ROUTES.me);
      role = currentUser.role === 'accountant' ? 'ac' : 'ht';
    } catch {
      window.location.href = '/login/';
      return;
    }

    window.addEventListener('hashchange', () => {
      loadPanel(location.hash.replace('#', '') || 'dashboard');
    });

    if (role === 'ac' && currentUser.mustChangePassword) {
      location.hash = 'profile';
    }

    on(qs('.sidebar-nav'), 'click', (e) => {
      const item = e.target.closest('.sidebar-item');
      if (!item) return;
      e.preventDefault();
      location.hash = item.getAttribute('href').replace('#', '');
    });

    on(byId('logoutLink'), 'click', async (e) => {
      e.preventDefault();
      try { await apiFetch(API_ROUTES.logout, { method: 'POST' }); }
      finally { window.location.href = '/'; }
    });

    on(document, 'click', (e) => {
      if (e.target.closest('.modal-close-btn') || e.target.classList.contains('modal-overlay')) {
        removeClassAll('.modal-overlay, .modal', 'open');
      }
    });

    await loadPanel(location.hash.replace('#', '') || 'dashboard');
  })();
}