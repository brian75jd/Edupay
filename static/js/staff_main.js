/* ==========================================================================
   staff_dashboard.js  (vanilla JS — no jQuery)
   --------------------------------------------------------------------------
   ENDPOINTS TO CONNECT (all under /api/ — adjust the prefix/paths to match
   your urls.py, then just swap the API dict below):

   Auth / current user
     GET   /api/auth/me/                 -> { id, phone, first_name, last_name,
                                               role: "headteacher"|"accountant",
                                               must_change_password: bool,
                                               school: {id, name, location, type} }
     POST  /api/auth/logout/             -> invalidates the token (if using token auth)

   School info (headteacher)
     GET   /api/schools/me/              -> { id, name, location, type }
     PATCH /api/schools/me/              -> body: { name, location, type }

   Accountants (headteacher only)
     GET    /api/accountants/            -> [ { id, phone, first_name, last_name, email,
                                                 must_change_password } ]
     POST   /api/accountants/            -> body: { first_name, last_name, email, phone }
                                              -> returns created record incl. default password
     PATCH  /api/accountants/<id>/       -> body: { first_name, last_name, email, phone }
     DELETE /api/accountants/<id>/       -> removes the accountant

   Transactions / students (used by the dashboard/reports tabs — fetch these
   from within those tabs' own scripts, exposed here as reusable helpers)
     GET /api/transactions/              -> [ { id, student, level, amount, date, method, status } ]
     GET /api/students/                  -> [ { name, level, phone, amount, date, term } ]

   Dashboard tab fragments (HTML partials per sidebar tab — these can stay as
   static files, or become server-rendered fragments later; only the fetch
   mechanics changed, not the URL shape)
     GET /static/{role}_content/{tab}.html
   ========================================================================== */
const API = {
  ME: "/api/auth/me/",
  LOGOUT: "/api/auth/logout/",
  SCHOOL_INFO: "/api/schools/me/",
  ACCOUNTANTS: "/api/accountants/",
  ACCOUNTANT_DETAIL: (id) => `/api/accountants/${id}/`,
  TRANSACTIONS: "/payment/transactions/",
  STUDENTS: "/api/students/",
  PROFILE: "/api/profile/",
  CHANGE_PASSWORD: "/api/auth/change-password/",
  TAB_FRAGMENT: (role, key) => `/static/${role}_content/${key}.html`,
};

function getCSRFToken() {
  var match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

async function apiRequest(url, options = {}) {
  var method = (options.method || 'GET').toUpperCase();
  var headers = { "Content-Type": "application/json" };
  if (['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(method) !== -1) {
    headers['X-CSRFToken'] = getCSRFToken();
  }
  Object.assign(headers, options.headers || {});

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: headers,
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      detail = body.detail || JSON.stringify(body);
    } catch (_) { /* ignore parse errors */ }
    throw new Error(detail);
  }

  if (response.status === 204) return null; 
  return response.json();
}

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const dashboardPanel = document.getElementById("panel-dashboard");
  if (!dashboardPanel) return;

  const tabLoaded = {};
  let currentUser = null;
  let role = "ht";
  window.fmtMoney = function (amount) {
    return "MWK " + Number(amount).toLocaleString();
  };

  window.fmtDate = function (d) {
    const parts = d.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return parseInt(parts[2], 10) + " " + months[parseInt(parts[1], 10) - 1] + " " + parts[0];
  };

  window.statusBadge = function (status) {
    if (["Paid", "Active", "Verified"].includes(status)) {
      return `<span class="badge badge-success">${status}</span>`;
    }
    if (["Partial", "Pending"].includes(status)) {
      return `<span class="badge badge-pending">${status}</span>`;
    }
    return `<span class="badge badge-failed">${status}</span>`;
  };

  window.methodIcon = function (method) {
    if (method === "Airtel Money") return '<i class="fa-solid fa-mobile-screen-button method-icon-airtel"></i> Airtel';
    if (method === "TNM Mpamba") return '<i class="fa-solid fa-mobile-screen-button method-icon-tnm"></i> TNM';
    if (method === "National Bank") return '<i class="fa-solid fa-building-columns method-icon-bank"></i> NB';
    return method;
  };


  // ── Fetch user data and populate dashboard ──
  try {
    currentUser = await apiRequest(API.ME);
    if (window.EDUPAY) window.EDUPAY.safeAssign('user', currentUser);

    if (currentUser.role === 'headteacher') role = 'ht';
    else if (currentUser.role === 'accountant') role = 'ac';

    const el = id => document.getElementById(id);

    if (el('ht-dash-welcome')) el('ht-dash-welcome').textContent = currentUser.firstName || '—';
    if (el('ht-dash-sname')) el('ht-dash-sname').textContent = currentUser.school?.name || '—';
    if (el('ht-dash-sloc')) el('ht-dash-sloc').textContent = currentUser.school?.location || '—';

    if (el('ht-school-name')) el('ht-school-name').textContent = currentUser.school?.name || '—';
    if (el('ht-school-location')) el('ht-school-location').textContent = currentUser.school?.location || '—';
    if (el('ht-school-type')) el('ht-school-type').textContent = currentUser.school?.type || '—';

    if (el('ht-prof-firstname')) el('ht-prof-firstname').value = currentUser.firstName || '';
    if (el('ht-prof-lastname'))  el('ht-prof-lastname').value  = currentUser.lastName || '';
    if (el('ht-prof-email'))     el('ht-prof-email').value     = currentUser.email || '';
    if (el('ht-prof-phone'))     el('ht-prof-phone').value     = (currentUser.phone || '').replace('+265', '');

    if (el('ac-dash-welcome'))   el('ac-dash-welcome').textContent  = currentUser.firstName || '—';
    if (el('ac-dash-sname'))     el('ac-dash-sname').textContent    = currentUser.school?.name || '—';
    if (el('ac-dash-sloc'))      el('ac-dash-sloc').textContent     = currentUser.school?.location || '—';

    if (el('ac-prof-firstname')) el('ac-prof-firstname').value = currentUser.firstName || '';
    if (el('ac-prof-lastname'))  el('ac-prof-lastname').value  = currentUser.lastName || '';
    if (el('ac-prof-email'))     el('ac-prof-email').value     = currentUser.email || '';
    if (el('ac-prof-phone'))     el('ac-prof-phone').value     = (currentUser.phone || '').replace('+265', '');

    if (role === "ac" && currentUser.must_change_password) {
      window.location.hash = "profile";
    }
  } catch (err) {
    console.error('Failed to load user data:', err);
  }

  window.fetchTransactions = () => apiRequest(API.TRANSACTIONS);
  window.fetchStudents = () => apiRequest(API.STUDENTS);
  window.fetchAccountants = () => apiRequest(API.ACCOUNTANTS);

  // ── Save Profile handler (both roles) ──
  var profileSaveBtn = document.getElementById('ht-prof-save-btn') || document.getElementById('ac-prof-save-btn');
  if (profileSaveBtn) {
    profileSaveBtn.addEventListener('click', async function () {
      var p = document.getElementById('ht-prof-save-btn') ? 'ht-' : 'ac-';
      var fn = window.toTitleCase(document.getElementById(p + 'prof-firstname').value.trim());
      var ln = window.toTitleCase(document.getElementById(p + 'prof-lastname').value.trim());
      var em = document.getElementById(p + 'prof-email').value.trim();
      var ph = '+265' + document.getElementById(p + 'prof-phone').value.trim();
      var err = document.getElementById(p + 'prof-error');
      if (!fn || !ln || !em || ph.length < 13) { if (err) err.textContent = 'Fill in all fields correctly'; return; }
      try {
        await apiRequest(API.PROFILE, { method: 'PATCH', body: JSON.stringify({ firstName: fn, lastName: ln, email: em, phone: ph }) });
        if (err) err.textContent = '';
        alert('Profile updated!');
      } catch (e) { if (err) err.textContent = e.message; }
    });
  }

  // ── Change Password handler (both roles) ──
  var passBtn = document.getElementById('ht-prof-change-pass-btn') || document.getElementById('ac-prof-change-pass-btn');
  if (passBtn) {
    passBtn.addEventListener('click', async function () {
      var p = document.getElementById('ht-prof-change-pass-btn') ? 'ht-' : 'ac-';
      var cur = document.getElementById(p + 'prof-cur-pass').value;
      var newP = document.getElementById(p + 'prof-new-pass').value;
      var con = document.getElementById(p + 'prof-confirm-pass').value;
      var err = document.getElementById(p + 'prof-pass-error');
      if (!cur) { if (err) err.textContent = 'Enter current password'; return; }
      if (!newP || newP.length < 6) { if (err) err.textContent = 'New password must be at least 6 characters'; return; }
      if (newP !== con) { if (err) err.textContent = 'Passwords do not match'; return; }
      try {
        await apiRequest(API.CHANGE_PASSWORD, { method: 'POST', body: JSON.stringify({ currentPassword: cur, newPassword: newP }) });
        if (err) err.textContent = '';
        alert('Password changed!');
        [p + 'prof-cur-pass', p + 'prof-new-pass', p + 'prof-confirm-pass'].forEach(function (id) { document.getElementById(id).value = ''; });
      } catch (e) { if (err) err.textContent = e.message; }
    });
  }

  window.refreshHtAccountants = async function () {
    try {
      var accountants = await window.fetchAccountants();
      var tbody = document.getElementById("ht-acc-table");
      var empty = document.getElementById("ht-acc-empty");
      if (!tbody) return;

      if (!accountants || accountants.length === 0) {
        tbody.innerHTML = "";
        if (empty) empty.style.display = "block";
        return;
      }

      if (empty) empty.style.display = "none";

      tbody.innerHTML = accountants.map(function (a) {
        var st = a.is_active ? "Active" : "Inactive";
        return "<tr>" +
          "<td>" + (a.firstName || "") + " " + (a.lastName || "") + "</td>" +
          "<td>" + (a.email || "—") + "</td>" +
          "<td>+265 " + (a.phone || "") + "</td>" +
          "<td>" + (typeof window.statusBadge === "function" ? window.statusBadge(st) : st) + "</td>" +
          "<td>" +
            '<button class="btn btn-sm btn-outline acc-view-btn" data-id="' + a.id +
              '" data-firstname="' + (a.firstName || "") +
              '" data-lastname="' + (a.lastName || "") +
              '" data-email="' + (a.email || "") +
              '" data-phone="' + (a.phone || "") +
              '" data-status="' + st +
              '" data-datejoined="' + (a.dateJoined || "") +
              '" data-lastlogin="' + (a.lastLogin || "") +
              '" style="margin-right:6px;"><i class="fa-solid fa-eye"></i> View</button>' +
            '<button class="btn btn-sm btn-outline acc-delete-btn" data-id="' + a.id +
              '" data-name="' + (a.firstName || "") + " " + (a.lastName || "") +
              '" data-email="' + (a.email || "") +
              '" data-phone="' + (a.phone || "") +
              '" data-status="' + st +
              '"><i class="fa-solid fa-trash"></i> Delete</button>' +
          "</td>" +
        "</tr>";
      }).join("");
    } catch (err) {
      console.error("Failed to load accountants:", err);
    }
  };

  window.refreshAcTransactions = async function () {
    try {
      var from = document.getElementById("ac-txn-from");
      var to = document.getElementById("ac-txn-to");
      var method = document.getElementById("ac-txn-method");
      var params = new URLSearchParams();
      if (from && from.value) params.append("from", from.value);
      if (to && to.value) params.append("to", to.value);
      if (method && method.value && method.value !== "all") params.append("method", method.value);
      var qs = params.toString();
      var resp = await apiRequest(API.TRANSACTIONS + (qs ? "?" + qs : ""));
      var data = resp.transactions || [];
      var tbody = document.getElementById("ac-txn-table");
      if (!tbody) return;
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">No transactions found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(function (t) {
        var dt = t.date_created ? t.date_created.split("T")[0] : "";
        return "<tr><td>" + (t.id || "") + "</td><td>" + (t.paid_for || "") + "</td><td></td><td>" + window.fmtMoney(t.amount || 0) + "</td><td></td><td>" + (dt ? window.fmtDate(dt) : "") + "</td><td>" + window.statusBadge(t.status || "") + "</td></tr>";
      }).join("");
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  };

  window.refreshAcStudents = async function () {
    try {
      var from = document.getElementById("ac-stu-from");
      var to = document.getElementById("ac-stu-to");
      var term = document.getElementById("ac-stu-term");
      var params = new URLSearchParams();
      if (from && from.value) params.append("from", from.value);
      if (to && to.value) params.append("to", to.value);
      if (term && term.value && term.value !== "all") params.append("term", term.value);
      var qs = params.toString();
      var data = await apiRequest(API.STUDENTS + (qs ? "?" + qs : ""));
      var tbody = document.getElementById("ac-stu-table");
      if (!tbody) return;
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">No students found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(function (s) {
        return "<tr><td>" + (s.name || "") + "</td><td>" + (s.level || "") + "</td><td>" + (s.phone || "") + "</td><td>" + window.fmtMoney(s.amount || 0) + "</td><td>" + (s.date || "") + "</td><td>" + (s.term || "") + "</td></tr>";
      }).join("");
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

   window.loadTab = function (key) {
    document.querySelectorAll(".dashboard-panel").forEach((el) => (el.style.display = "none"));
    const panel = document.getElementById("panel-" + key);
    if (panel) panel.style.display = "block";

    document.querySelectorAll(".sidebar-item").forEach((el) => el.classList.remove("active"));
    const sidebarItem = document.querySelector(`.sidebar-item[data-tab="${key}"]`);
    if (sidebarItem) sidebarItem.classList.add("active");

    if (tabLoaded[key]) return;
    tabLoaded[key] = true;

    fetch(API.TAB_FRAGMENT(role, key))
      .then((res) => res.text())
      .then((html) => {
        if (panel) panel.insertAdjacentHTML("beforeend", html);
      })
      .catch((err) => console.error(`Failed to load tab fragment "${key}":`, err));

    if (key === "accountants") {
      window.refreshHtAccountants();
    }
    if (key === "transactions") {
      if (document.getElementById("ac-txn-table")) {
        window.refreshAcTransactions();
      }
    }
    if (key === "students") {
      if (document.getElementById("ac-stu-table")) {
        window.refreshAcStudents();
      }
    }
  };

  const sidebarNav = document.querySelector(".sidebar-nav");
  if (sidebarNav) {
    sidebarNav.addEventListener("click", (e) => {
      const item = e.target.closest(".sidebar-item");
      if (!item) return;
      e.preventDefault();
      const tab = item.dataset.tab;
      window.location.hash = tab;
      history.pushState({ tab }, "", "#" + tab);
    });
  }

  window.addEventListener("hashchange", () => {
    const key = window.location.hash.replace("#", "") || "dashboard";
    window.loadTab(key);
  });

  window.onpopstate = (e) => {
    if (e.state) window.loadTab(e.state.tab);
  };

   const initialTab = window.location.hash.replace("#", "") || "dashboard";
  window.loadTab(initialTab);

  // ── Transaction filter buttons ──
  var txnApply = document.getElementById("ac-txn-apply");
  var txnReset = document.getElementById("ac-txn-reset");
  if (txnApply) txnApply.addEventListener("click", function () { window.refreshAcTransactions(); });
  if (txnReset) txnReset.addEventListener("click", function () {
    var from = document.getElementById("ac-txn-from");
    var to = document.getElementById("ac-txn-to");
    var method = document.getElementById("ac-txn-method");
    if (from) from.value = "";
    if (to) to.value = "";
    if (method) method.value = "all";
    window.refreshAcTransactions();
  });

  // ── Student filter buttons ──
  var stuApply = document.getElementById("ac-stu-apply");
  var stuReset = document.getElementById("ac-stu-reset");
  if (stuApply) stuApply.addEventListener("click", function () { window.refreshAcStudents(); });
  if (stuReset) stuReset.addEventListener("click", function () {
    var from = document.getElementById("ac-stu-from");
    var to = document.getElementById("ac-stu-to");
    var term = document.getElementById("ac-stu-term");
    if (from) from.value = "";
    if (to) to.value = "";
    if (term) term.value = "all";
    window.refreshAcStudents();
  });

  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await apiRequest(API.LOGOUT, { method: "POST" });
      } catch (err) {
        console.error("Logout request failed:", err);
      } finally {
        window.location.href = "/";
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".modal-close-btn") || e.target.classList.contains("modal-overlay")) {
      document.querySelectorAll(".modal-overlay.open, .modal.open").forEach((el) => el.classList.remove("open"));
    }
  });

  document.addEventListener("click", async (e) => {
    if (!e.target.closest("#schoolModalSaveBtn")) return;

    const name = window.toTitleCase(document.getElementById("schoolModalName").value.trim());
    const location = window.toTitleCase(document.getElementById("schoolModalLocation").value.trim());
    const type = document.getElementById("schoolModalType").value;
    const errorEl = document.getElementById("schoolModalError");

    if (!name || !location || !type) {
      errorEl.textContent = "Please fill in all fields";
      return;
    }
    errorEl.textContent = "";

    try {
      await apiRequest(API.SCHOOL_INFO, {
        method: "PATCH",
        body: JSON.stringify({ name, location, type }),
      });
      document.getElementById("schoolModal")?.classList.remove("open");
      document.getElementById("schoolModalOverlay")?.classList.remove("open");

      if (typeof window.refreshHtSchool === "function") {
        window.refreshHtSchool();
      } else {
        window.location.reload();
      }
    } catch (err) {
      errorEl.textContent = err.message || "Failed to save school info";
    }
  });

  // ── Accountant modal save / edit / delete (headteacher only) ──────
  if (document.getElementById("accModalSaveBtn")) {
    let editingAccId = null;

    document.getElementById("accModalSaveBtn").addEventListener("click", async () => {
    const fn = window.toTitleCase(document.getElementById("accModalFirstName").value.trim());
    const ln = window.toTitleCase(document.getElementById("accModalLastName").value.trim());
      const em = document.getElementById("accModalEmail").value.trim();
      const ph = document.getElementById("accModalPhone").value.trim();
      const errorEl = document.getElementById("accModalError");

      if (!fn || !ln || !em || !ph || ph.length < 9) {
        errorEl.textContent = "Please fill in all fields correctly";
        return;
      }
      errorEl.textContent = "";

      const payload = { firstName: fn, lastName: ln, email: em, phone: ph };

      try {
        if (editingAccId) {
          await apiRequest(API.ACCOUNTANT_DETAIL(editingAccId), {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          const created = await apiRequest(API.ACCOUNTANTS, {
            method: "POST",
            body: JSON.stringify(payload),
          });
          // Backend should return the generated default password once, on creation.
          if (created && created.default_password) {
            alert("Default password: " + created.default_password);
          }
        }

        document.getElementById("accountantModal")?.classList.remove("open");
        document.getElementById("accountantModalOverlay")?.classList.remove("open");

        if (typeof window.refreshHtAccountants === "function") {
          window.refreshHtAccountants();
        }
      } catch (err) {
        errorEl.textContent = err.message || "Failed to save accountant";
      }
    });

    document.getElementById("confirmDeleteBtn")?.addEventListener("click", async function () {
      const id = this.dataset.accountantId;
      if (!id) return;

      try {
        await apiRequest(API.ACCOUNTANT_DETAIL(id), { method: "DELETE" });
        document.getElementById("confirmModal")?.classList.remove("open");
        document.getElementById("confirmModalOverlay")?.classList.remove("open");

        if (typeof window.refreshHtAccountants === "function") {
          window.refreshHtAccountants();
        }
      } catch (err) {
        console.error("Failed to delete accountant:", err);
        alert(err.message || "Failed to delete accountant");
      }
    });

    
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#addAccountantBtn")) return;
      editingAccId = null;
      document.getElementById("accountantModalTitle").textContent = "Add Accountant";
      ["accModalFirstName", "accModalLastName", "accModalEmail", "accModalPhone"].forEach(
        (id) => (document.getElementById(id).value = "")
      );
      document.getElementById("accModalError").textContent = "";
      document.getElementById("accountantModal")?.classList.add("open");
      document.getElementById("accountantModalOverlay")?.classList.add("open");
    });

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc-edit-btn");
      if (!btn) return;

      editingAccId = btn.dataset.id;
      document.getElementById("accountantModalTitle").textContent = "Edit Accountant";
      document.getElementById("accModalFirstName").value = btn.dataset.firstName || "";
      document.getElementById("accModalLastName").value = btn.dataset.lastName || "";
      document.getElementById("accModalEmail").value = btn.dataset.email || "";
      document.getElementById("accModalPhone").value = btn.dataset.phone || "";
      document.getElementById("accModalError").textContent = "";
      document.getElementById("accountantModal")?.classList.add("open");
      document.getElementById("accountantModalOverlay")?.classList.add("open");
    });

    // Open delete confirmation modal
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc-delete-btn");
      if (!btn) return;

      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const email = btn.dataset.email || '—';
      const phone = btn.dataset.phone || '—';
      const st = btn.dataset.status || '—';
      document.getElementById("confirmDeleteName").textContent = name;
      document.getElementById("confirmDeleteEmail").textContent = email;
      document.getElementById("confirmDeletePhone").textContent = '+265 ' + phone;
      document.getElementById("confirmDeleteStatus").innerHTML = typeof window.statusBadge === 'function' ? window.statusBadge(st) : st;
      document.getElementById("confirmDeleteBtn").dataset.accountantId = id;
      document.getElementById("confirmModal")?.classList.add("open");
      document.getElementById("confirmModalOverlay")?.classList.add("open");
    });

    // View accountant details modal
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc-view-btn");
      if (!btn) return;

      var el = function (id) { return document.getElementById(id); };

      el("viewAccName").textContent = (btn.dataset.firstname || "") + " " + (btn.dataset.lastname || "");
      el("viewAccEmail").textContent = btn.dataset.email || "—";
      el("viewAccPhone").textContent = "+265 " + (btn.dataset.phone || "");
      el("viewAccStatus").innerHTML = typeof window.statusBadge === "function" ? window.statusBadge(btn.dataset.status || "") : (btn.dataset.status || "—");
      el("viewAccDateJoined").textContent = btn.dataset.datejoined ? new Date(btn.dataset.datejoined).toLocaleDateString() : "—";
      el("viewAccLastLogin").textContent = btn.dataset.lastlogin ? new Date(btn.dataset.lastlogin).toLocaleDateString() : "Never";

      el("viewAccModal")?.classList.add("open");
      el("viewAccModalOverlay")?.classList.add("open");
    });

    // Empty state add accountant button
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#addAccountantBtnEmpty")) return;
      editingAccId = null;
      document.getElementById("accountantModalTitle").textContent = "Add Accountant";
      ["accModalFirstName", "accModalLastName", "accModalEmail", "accModalPhone"].forEach(
        function (id) { document.getElementById(id).value = ""; }
      );
      document.getElementById("accModalError").textContent = "";
      document.getElementById("accountantModal")?.classList.add("open");
      document.getElementById("accountantModalOverlay")?.classList.add("open");
    });
  }
}