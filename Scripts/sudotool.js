// Same backend as index.html.
const API_BASE = "https://cobolt-1-xmcq.gaur-alnilam.ts.net/";

let authToken = null;
let currentUsername = null;

const statusEl = document.getElementById("status");
const tbody = document.getElementById("user-table-body");

async function signIn() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      document.getElementById("auth-message").innerText = data.error || "Sign in failed.";
      return;
    }

    authToken = data.token;
    currentUsername = data.username;

    document.getElementById("auth-section").style.display = "none";
    document.getElementById("admin-section").style.display = "";
    loadUsers();
  } catch (e) {
    document.getElementById("auth-message").innerText = "Could not reach server: " + e.message;
  }
}

function authHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function loadUsers() {
  statusEl.textContent = "Loading users...";
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders() });

    if (res.status === 401) {
      statusEl.textContent = "You must be logged in.";
      return;
    }
    if (res.status === 403) {
      statusEl.textContent = "Admins only.";
      return;
    }
    if (!res.ok) {
      const text = await res.text();
      statusEl.textContent = `Server error (${res.status}): ${text.slice(0, 200)}`;
      return;
    }

    const users = await res.json();
    renderUsers(users);
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "Failed to load users: " + err.message;
  }
}

function renderUsers(users) {
  tbody.innerHTML = "";

  for (const u of users) {
    const tr = document.createElement("tr");

    const idTd = document.createElement("td");
    idTd.textContent = u.id;

    const nameTd = document.createElement("td");
    nameTd.textContent = u.username;

    const adminTd = document.createElement("td");
    adminTd.textContent = u.is_admin ? "Yes" : "No";

    const bannedTd = document.createElement("td");
    bannedTd.textContent = u.banned ? "Yes" : "No";

    const actionTd = document.createElement("td");

    if (u.username !== "Cobolt") {
      const adminBtn = document.createElement("button");
      adminBtn.className = u.is_admin ? "revoke" : "grant";
      adminBtn.textContent = u.is_admin ? "Revoke Admin" : "Grant Admin";
      adminBtn.onclick = () => toggleAdmin(u.id, u.is_admin);
      actionTd.appendChild(adminBtn);

      const banBtn = document.createElement("button");
      banBtn.className = u.banned ? "unban" : "ban";
      banBtn.textContent = u.banned ? "Unban" : "Ban";
      banBtn.onclick = () => toggleBan(u.id, u.banned);
      actionTd.appendChild(banBtn);
    } else {
      actionTd.textContent = "Founder";
    }

    tr.append(idTd, nameTd, adminTd, bannedTd, actionTd);
    tbody.appendChild(tr);
  }
}

async function toggleAdmin(userId, isCurrentlyAdmin) {
  const action = isCurrentlyAdmin ? "revoke" : "grant";
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/${action}`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      statusEl.textContent = data.error || "Action failed.";
      return;
    }

    statusEl.textContent = data.message;
    loadUsers();
  } catch (err) {
    statusEl.textContent = "Request failed: " + err.message;
  }
}

async function toggleBan(userId, isCurrentlyBanned) {
  const action = isCurrentlyBanned ? "unban" : "ban";
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/${action}`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      statusEl.textContent = data.error || "Action failed.";
      return;
    }

    statusEl.textContent = data.message;
    loadUsers();
  } catch (err) {
    statusEl.textContent = "Request failed: " + err.message;
  }
}
