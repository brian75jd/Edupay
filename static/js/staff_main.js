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
  TRANSACTIONS: "/api/transactions/",
  STUDENTS: "/api/students/",
  TAB_FRAGMENT: (role, key) => `/static/${role}_content/${key}.html`,
};

/** Wrapper around fetch: adds auth header + JSON handling, throws on non-2xx. */
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("authToken"); // auth token is fine to keep client-side
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      detail = body.detail || JSON.stringify(body);
    } catch (_) { /* ignore parse errors */ }
    throw new Error(detail);
  }

  if (response.status === 204) return null; // e.g. DELETE with no content
  return response.json();
}

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const dashboardPanel = document.getElementById("panel-dashboard");
  if (!dashboardPanel) return;

  const tabLoaded = {};
  let currentUser = null;
  let role = "ht";

  // ── Fetch current user (replaces localStorage.getItem('currentUser')) ──
  try {
    currentUser = await apiRequest(API.ME);
    role = currentUser.role === "accountant" ? "ac" : "ht";
  } catch (err) {
    console.error("Failed to load current user:", err);
    // Optionally redirect to login if the session/token is invalid:
    // window.location.href = "/school/login/";
    return;
  }

  // ── Helpers (exposed globally, same names as before) ──────────────────
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

  // Reusable data fetchers for tab-specific scripts to call instead of
  // reading localStorage directly.
  window.fetchTransactions = () => apiRequest(API.TRANSACTIONS);
  window.fetchStudents = () => apiRequest(API.STUDENTS);

  // ── Router ──────────────────────────────────────────────────────────
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
  };

  // Force a password change for accountants flagged by the backend
  // (replaces the localStorage 'staffAccounts' lookup).
  if (role === "ac" && currentUser.must_change_password) {
    window.location.hash = "profile";
  }

  // ── Sidebar clicks (event delegation, no jQuery) ───────────────────
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

  // ── Initial load ────────────────────────────────────────────────────
  const initialTab = window.location.hash.replace("#", "") || "dashboard";
  window.loadTab(initialTab);

  // ── Logout ──────────────────────────────────────────────────────────
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await apiRequest(API.LOGOUT, { method: "POST" });
      } catch (err) {
        console.error("Logout request failed:", err);
      } finally {
        localStorage.removeItem("authToken");
        window.location.href = "/";
      }
    });
  }

  // ── Modal close (event delegation) ─────────────────────────────────
  document.addEventListener("click", (e) => {
    if (e.target.closest(".modal-close-btn") || e.target.classList.contains("modal-overlay")) {
      document.querySelectorAll(".modal-overlay.open, .modal.open").forEach((el) => el.classList.remove("open"));
    }
  });

  // ── School modal save (headteacher) ────────────────────────────────
  document.addEventListener("click", async (e) => {
    if (!e.target.closest("#schoolModalSaveBtn")) return;

    const name = document.getElementById("schoolModalName").value.trim();
    const location = document.getElementById("schoolModalLocation").value.trim();
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
      const fn = document.getElementById("accModalFirstName").value.trim();
      const ln = document.getElementById("accModalLastName").value.trim();
      const em = document.getElementById("accModalEmail").value.trim();
      const ph = document.getElementById("accModalPhone").value.trim();
      const errorEl = document.getElementById("accModalError");

      if (!fn || !ln || !em || !ph || ph.length < 9) {
        errorEl.textContent = "Please fill in all fields correctly";
        return;
      }
      errorEl.textContent = "";

      const payload = { first_name: fn, last_name: ln, email: em, phone: ph };

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

    // Open add modal
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

    // Open edit modal — expects data-id, data-first-name, data-last-name,
    // data-email, data-phone attributes on the trigger button, populated
    // from the accountants list you fetched via GET /api/accountants/.
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
      document.getElementById("confirmDeleteName").textContent = name;
      document.getElementById("confirmDeleteBtn").dataset.accountantId = id;
      document.getElementById("confirmModal")?.classList.add("open");
      document.getElementById("confirmModalOverlay")?.classList.add("open");
    });
  }
}