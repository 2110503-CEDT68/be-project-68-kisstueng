// main.js

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("crudSection").style.display = "none";

  document.getElementById("registerForm").addEventListener("submit", registerUser);
  document.getElementById("loginForm").addEventListener("submit", loginUser);
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
  document.getElementById("dentistForm").addEventListener("submit", addDentist);
  document.getElementById("addBookingBtn").addEventListener("click", addBooking);

  token = localStorage.getItem("token");
  currentRole = localStorage.getItem("role");
  currentUserId = localStorage.getItem("userId");
  if (token) {
    document.getElementById("logoutBtn").style.display = "block";
    document.getElementById("crudSection").style.display = "block";
    loadDentists();
    loadBookings();
  }
});

let token = null;
let currentRole = null;
let currentUserId = null;

// ---------------- AUTH ----------------
async function registerUser(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById("regName").value,
    tel: document.getElementById("regTel").value,
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

  if (!data.success || !data.token) {
    alert("Login failed: " + (data.msg || "Unknown error"));
    return;
  }

  token = data.token;
  localStorage.setItem("token", token);

  const meRes = await fetch("/api/v1/auth/me", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const meData = await meRes.json();

  currentRole = meData.data ? meData.data.role : null;
  currentUserId = meData.data ? meData.data._id : null;
  localStorage.setItem("role", currentRole);
  localStorage.setItem("userId", currentUserId);

  alert("Login successful! Role: " + currentRole);

  document.getElementById("logoutBtn").style.display = "block";
  document.getElementById("crudSection").style.display = "block";

  await loadDentists();
  await loadBookings();
}

function logoutUser() {
  token = null;
  currentRole = null;
  currentUserId = null;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  alert("Logged out.");
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("crudSection").style.display = "none";
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
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.name}</td>
      <td>${d.specialty}</td>
      <td>${d.experience}</td>
      <td>${d.tel}</td>
      <td>${d.clinicName}</td>
      <td>
        <button class="action edit-dentist-btn" data-id="${d._id}" ${currentRole !== "admin" ? "disabled" : ""}>Edit</button>
        <button class="action delete-dentist-btn" data-id="${d._id}" ${currentRole !== "admin" ? "disabled" : ""}>Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Attach event listeners instead of inline onclick (fixes CSP)
  document.querySelectorAll(".edit-dentist-btn").forEach(btn => {
    btn.addEventListener("click", () => editDentist(btn.dataset.id));
  });
  document.querySelectorAll(".delete-dentist-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteDentist(btn.dataset.id));
  });
}

async function addDentist(e) {
  e.preventDefault();
  if (currentRole !== "admin") {
    alert("Only admins can add dentists.");
    return;
  }
  const body = {
    name: document.getElementById("dentistName").value,
    specialty: document.getElementById("dentistSpecialty").value,
    experience: document.getElementById("dentistExperience").value,
    tel: document.getElementById("dentistTel").value,
    clinicName: document.getElementById("dentistClinic").value
  };
  const res = await fetch("/api/v1/dentists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.success) {
    alert("Dentist added successfully!");
    loadDentists();
  } else {
    alert("Failed to add dentist: " + JSON.stringify(data));
  }
}

function showEditDentistModal(d) {
  return new Promise((resolve) => {
    const existing = document.getElementById("editDentistModal");
    if (existing) existing.remove();

    const specialties = [
      "General Dentistry",
      "Orthodontics",
      "Endodontics",
      "Pediatric Dentistry",
      "Oral Surgery",
      "Cosmetic Dentistry"
    ];

    const specialtyOptions = specialties.map(s =>
      `<option value="${s}" ${d.specialty === s ? "selected" : ""}>${s}</option>`
    ).join("");

    const modal = document.createElement("div");
    modal.id = "editDentistModal";
    modal.style.cssText = `
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.5); display:flex;
      align-items:center; justify-content:center; z-index:9999;
    `;
    modal.innerHTML = `
      <div style="background:#fff; padding:30px; border-radius:8px; min-width:350px; display:flex; flex-direction:column; gap:12px;">
        <h3 style="margin:0 0 8px">Edit Dentist</h3>
        <label>Name
          <input id="edit_name" value="${d.name}" style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;" />
        </label>
        <label>Specialty
          <select id="edit_specialty" style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;">
            ${specialtyOptions}
          </select>
        </label>
        <label>Experience (0–30 years)
          <input id="edit_experience" type="number" min="0" max="30" value="${d.experience}"
            style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;" />
        </label>
        <label>Tel
          <input id="edit_tel" value="${d.tel}" style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;" />
        </label>
        <label>Clinic Name
          <input id="edit_clinicName" value="${d.clinicName}" style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;" />
        </label>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
          <button id="editCancelBtn" style="padding:8px 16px;">Cancel</button>
          <button id="editSaveBtn" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("editCancelBtn").addEventListener("click", () => {
      modal.remove();
      resolve(null);
    });

    document.getElementById("editSaveBtn").addEventListener("click", () => {
      const experience = parseInt(document.getElementById("edit_experience").value, 10);
      if (isNaN(experience) || experience < 0 || experience > 30) {
        alert("Experience must be a number between 0 and 30.");
        return;
      }
      resolve({
        name: document.getElementById("edit_name").value.trim(),
        specialty: document.getElementById("edit_specialty").value,
        experience,
        tel: document.getElementById("edit_tel").value.trim(),
        clinicName: document.getElementById("edit_clinicName").value.trim()
      });
      modal.remove();
    });
  });
}

async function editDentist(id) {
  const existing = await fetch(`/api/v1/dentists/${id}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const existingData = await existing.json();
  const d = existingData.data;

  const updated = await showEditDentistModal(d);
  if (!updated) return;

  const res = await fetch(`/api/v1/dentists/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updated)
  });
  const data = await res.json();
  if (data.success) {
    alert("Dentist updated successfully!");
    loadDentists();
  } else {
    alert("Failed to update dentist: " + JSON.stringify(data));
  }
}

async function deleteDentist(id) {
  const confirmed = confirm("Are you sure you want to delete this dentist?");
  if (!confirmed) return;

  const res = await fetch(`/api/v1/dentists/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.success) {
    alert("Dentist deleted successfully!");
    loadDentists();
  } else {
    alert("Failed to delete dentist: " + JSON.stringify(data));
  }
}

// ---------------- BOOKINGS ----------------
async function loadBookings() {
  const res = await fetch("/api/v1/bookings", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.querySelector("#bookingTable tbody");
  tbody.innerHTML = "";

  data.data.forEach(b => {
    const userDisplay = typeof b.user === "object" ? b.user.name : b.user;
    const bookingUserId = typeof b.user === "object" ? b.user._id : b.user;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(b.apptDate).toLocaleDateString()}</td>
      <td>${userDisplay}</td>
      <td>${b.dentist.name}</td>
      <td>
        <button class="action edit-booking-btn" data-id="${b._id}" ${(currentRole !== "admin" && bookingUserId !== currentUserId) ? "disabled" : ""}>Edit</button>
        <button class="action delete-booking-btn" data-id="${b._id}" ${(currentRole !== "admin" && bookingUserId !== currentUserId) ? "disabled" : ""}>Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Attach event listeners instead of inline onclick (fixes CSP)
  document.querySelectorAll(".edit-booking-btn").forEach(btn => {
    btn.addEventListener("click", () => editBooking(btn.dataset.id));
  });
  document.querySelectorAll(".delete-booking-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteBooking(btn.dataset.id));
  });
}

function showAddBookingModal(dentists) {
  return new Promise((resolve) => {
    const existing = document.getElementById("addBookingModal");
    if (existing) existing.remove();

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const dentistOptions = dentists.map(d =>
      `<option value="${d._id}">${d.name} — ${d.specialty}</option>`
    ).join("");

    const modal = document.createElement("div");
    modal.id = "addBookingModal";
    modal.style.cssText = `
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.5); display:flex;
      align-items:center; justify-content:center; z-index:9999;
    `;
    modal.innerHTML = `
      <div style="background:#fff; padding:30px; border-radius:8px; min-width:380px; display:flex; flex-direction:column; gap:14px;">
        <h3 style="margin:0 0 8px">Add Booking</h3>

        <label>Appointment Date (must be in the future)
          <input id="add_apptDate" type="date" min="${tomorrow}"
            style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;" />
        </label>

        <label>Dentist
          <select id="add_dentist" style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;">
            ${dentistOptions}
          </select>
        </label>

        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
          <button id="addBookingCancelBtn" style="padding:8px 16px;">Cancel</button>
          <button id="addBookingSaveBtn" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Add</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("addBookingCancelBtn").addEventListener("click", () => {
      modal.remove();
      resolve(null);
    });

    document.getElementById("addBookingSaveBtn").addEventListener("click", () => {
      const apptDate = document.getElementById("add_apptDate").value;
      if (!apptDate) {
        alert("Please select an appointment date.");
        return;
      }
      if (new Date(apptDate) <= new Date()) {
        alert("Appointment date must be in the future.");
        return;
      }
      resolve({
        apptDate,
        dentist: document.getElementById("add_dentist").value
      });
      modal.remove();
    });
  });
}

async function addBooking() {
  const dentistsRes = await fetch("/api/v1/dentists", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const dentistsData = await dentistsRes.json();

  const body = await showAddBookingModal(dentistsData.data);
  if (!body) return;

  // Controller uses req.user.id automatically — just send dentist + apptDate
  const res = await fetch("/api/v1/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.success) {
    alert("Booking added successfully!");
    loadBookings();
  } else {
    alert("Failed to add booking: " + JSON.stringify(data));
  }
}

function showEditBookingModal(b, dentists) {
  return new Promise((resolve) => {
    const existing = document.getElementById("editBookingModal");
    if (existing) existing.remove();

    const currentDate = b.apptDate ? new Date(b.apptDate).toISOString().split("T")[0] : "";
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const currentDentistId = typeof b.dentist === "object" ? b.dentist._id : b.dentist;

    const dentistOptions = dentists.map(d =>
      `<option value="${d._id}" ${d._id === currentDentistId ? "selected" : ""}>${d.name} — ${d.specialty}</option>`
    ).join("");

    const modal = document.createElement("div");
    modal.id = "editBookingModal";
    modal.style.cssText = `
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.5); display:flex;
      align-items:center; justify-content:center; z-index:9999;
    `;
    modal.innerHTML = `
      <div style="background:#fff; padding:30px; border-radius:8px; min-width:380px; display:flex; flex-direction:column; gap:14px;">
        <h3 style="margin:0 0 8px">Edit Booking</h3>

        <label>Appointment Date (must be in the future)
          <input id="edit_apptDate" type="date" value="${currentDate}" min="${tomorrow}"
            style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;" />
        </label>

        <label>Dentist
          <select id="edit_dentist" style="display:block;width:100%;padding:6px;margin-top:4px;box-sizing:border-box;">
            ${dentistOptions}
          </select>
        </label>

        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
          <button id="editBookingCancelBtn" style="padding:8px 16px;">Cancel</button>
          <button id="editBookingSaveBtn" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("editBookingCancelBtn").addEventListener("click", () => {
      modal.remove();
      resolve(null);
    });

    document.getElementById("editBookingSaveBtn").addEventListener("click", () => {
      const apptDate = document.getElementById("edit_apptDate").value;
      if (!apptDate) {
        alert("Please select an appointment date.");
        return;
      }
      if (new Date(apptDate) <= new Date()) {
        alert("Appointment date must be in the future.");
        return;
      }
      resolve({
        apptDate,
        dentist: document.getElementById("edit_dentist").value
      });
      modal.remove();
    });
  });
}

async function editBooking(id) {
  const [bookingRes, dentistsRes] = await Promise.all([
    fetch(`/api/v1/bookings/${id}`, { headers: { "Authorization": `Bearer ${token}` } }),
    fetch("/api/v1/dentists",       { headers: { "Authorization": `Bearer ${token}` } })
  ]);

  const bookingData  = await bookingRes.json();
  const dentistsData = await dentistsRes.json();

  const updated = await showEditBookingModal(bookingData.data, dentistsData.data);
  if (!updated) return;

  const res = await fetch(`/api/v1/bookings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updated)
  });
  const data = await res.json();
  if (data.success) {
    alert("Booking updated successfully!");
    loadBookings();
  } else {
    alert("Failed to update booking: " + JSON.stringify(data));
  }
}

async function deleteBooking(id) {
  const confirmed = confirm("Are you sure you want to delete this booking?");
  if (!confirmed) return;

  const res = await fetch(`/api/v1/bookings/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.success) {
    alert("Booking deleted successfully!");
    loadBookings();
  } else {
    alert("Failed to delete booking: " + JSON.stringify(data));
  }
}