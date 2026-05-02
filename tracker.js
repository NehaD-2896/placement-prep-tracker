const API_URL = 'http://127.0.0.1:5000';

async function addRole() {
    const role_name = document.getElementById('roleInput').value;
    const company = document.getElementById('companyInput').value;

    await fetch(`${API_URL}/add-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_name, company })
    });
    
    loadRoles(); // Refresh the display
}

async function loadRoles() {
    const response = await fetch(`${API_URL}/roles`);
    const roles = await response.json();
    
    const grid = document.getElementById('rolesGrid');
    grid.innerHTML = ''; 

    roles.forEach(role => {
        grid.innerHTML += `
            <div class="role-card">
                <h3>${role.role_name}</h3>
                <p>@ ${role.company}</p>
                <button onclick="viewTasks(${role.id})">Track Daily Prep</button>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', loadRoles);
