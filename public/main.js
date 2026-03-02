document.addEventListener("DOMContentLoaded", () => {
  // Auth
  document.getElementById("registerForm").addEventListener("submit", registerUser);
  document.getElementById("loginForm").addEventListener("submit", loginUser);
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);

  // CRUD
  document.getElementById("dentistForm").addEventListener("submit", addDentist);
  document.getElementById("appointmentForm").addEventListener("submit", addAppointment);
});

let token = null;
let userMap = {}; // lookup map of userId → name

// ---------------- AUTH ----------------
async function registerUser(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById("regName").value,
    telephone: document.getElementById("regTel").value,
    email: document.getElementById("regEmail").value,
    password: document.getElementById("regPassword").value,
    role: document.getElementById("regRole").value
  };
  const res = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  alert("Registered: " + JSON.stringify(data));
}

async function loginUser(e) {
  e.preventDefault();
  const body = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value
  };
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  token = data.token;
  localStorage.setItem("token", token);
  alert("Login successful!");

  document.getElementById("logoutBtn").style.display = "block";
  document.getElementById("crudSection").style.display = "block";

  await loadUsers();      // build userMap
  await loadDentists();
  await loadAppointments();
}

function logoutUser() {
  token = null;
  localStorage.removeItem("token");
  alert("Logged out.");
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("crudSection").style.display = "none";
}

// ---------------- USERS (for lookup) ----------------
async function loadUsers() {
  try {
    const res = await fetch("/api/v1/users", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    userMap = {};
    data.data.forEach(u => {
      userMap[u._id] = u.name;
    });
  } catch (err) {
    console.error("Could not load users:", err);
  }
}

// ---------------- DENTISTS ----------------
async function loadDentists() {
  const res = await fetch("/api/v1/dentists", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.querySelector("#dentistTable tbody");
  tbody.innerHTML = "";
  data.data.forEach(d => {
    const row = `<tr>
      <td>${d.name}</td>
      <td>${d.specialty}</td>
      <td>${d.experience}</td>
      <td>${d.tel}</td>
      <td>
        <button class="action" onclick="editDentist('${d._id}')">Edit</button>
        <button class="action" onclick="deleteDentist('${d._id}')">Delete</button>
      </td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

async function addDentist(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById("dentistName").value,
    specialty: document.getElementById("dentistSpecialty").value,
    experience: document.getElementById("dentistExperience").value,
    tel: document.getElementById("dentistTel").value
  };
  await fetch("/api/v1/dentists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  loadDentists();
}

async function editDentist(id) {
  const newSpecialty = prompt("Enter new specialty:");
  if (!newSpecialty) return;
  await fetch(`/api/v1/dentists/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ specialty: newSpecialty })
  });
  loadDentists();
}

async function deleteDentist(id) {
  await fetch(`/api/v1/dentists/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  loadDentists();
}

// ---------------- APPOINTMENTS ----------------
async function loadAppointments() {
  const res = await fetch("/api/v1/appointments", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.querySelector("#appointmentTable tbody");
  tbody.innerHTML = "";

  data.data.forEach(a => {
    // Translate user ID to name if available
    const userDisplay = typeof a.user === "object" ? a.user.name : (userMap[a.user] || a.user);

    const row = `<tr>
      <td>${new Date(a.apptDate).toLocaleDateString()}</td>
      <td>${userDisplay}</td>
      <td>${a.dentist.name}</td>
      <td>
        <button class="action" onclick="editAppointment('${a._id}')">Edit</button>
        <button class="action" onclick="deleteAppointment('${a._id}')">Delete</button>
      </td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

async function addAppointment(e) {
  e.preventDefault();
  const body = {
    apptDate: document.getElementById("appointmentDate").value,
    user: document.getElementById("appointmentUser").value,
    dentist: document.getElementById("appointmentDentist").value
  };
  await fetch(`/api/v1/dentists/${body.dentist}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  loadAppointments();
}

async function editAppointment(id) {
  const newDate = prompt("Enter new date (YYYY-MM-DD):");
  if (!newDate) return;
  await fetch(`/api/v1/appointments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ apptDate: newDate })
  });
  loadAppointments();
}

async function deleteAppointment(id) {
  await fetch(`/api/v1/appointments/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  loadAppointments();
}
