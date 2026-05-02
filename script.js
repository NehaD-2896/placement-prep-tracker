const API = "http://127.0.0.1:5000";

async function addRole() {
    const role = document.getElementById("roleInput").value;

    await fetch(`${API}/add_role`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({role_name: role})
    });

    loadRoles();
}

async function loadRoles() {
    const res = await fetch(`${API}/roles`);
    const data = await res.json();

    const list = document.getElementById("roleList");
    list.innerHTML = "";

    data.forEach(r => {
        const li = document.createElement("li");
        li.innerText = `${r.id} - ${r.role_name}`;
        list.appendChild(li);
    });
}

async function addApplication() {
    const data = {
        role_id: document.getElementById("roleIdApp").value,
        company: document.getElementById("company").value,
        status: document.getElementById("status").value,
        date: document.getElementById("date").value
    };

    await fetch(`${API}/add_application`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
}

async function addPrep() {
    const data = {
        role_id: document.getElementById("roleIdPrep").value,
        date: document.getElementById("prepDate").value,
        dsa: document.getElementById("dsa").value,
        subjects: document.getElementById("subjects").value,
        hours: document.getElementById("hours").value
    };

    await fetch(`${API}/add_prep`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
}

loadRoles();
