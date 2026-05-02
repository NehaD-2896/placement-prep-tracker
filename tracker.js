const API_URL = 'http://127.0.0.1:5000';

async function loadTopics() {
    const response = await fetch(`${API_URL}/topics`);
    const topics = await response.json();
    
    const tableBody = document.getElementById('topicTableBody');
    tableBody.innerHTML = ''; 

    topics.forEach(t => {
        const row = `
            <tr>
                <td>${t.topic_name}</td>
                <td>${t.problems_solved}</td>
                <td><span class="status-${t.status.toLowerCase().replace(' ', '-')}">${t.status}</span></td>
                <td>
                    <button class="delete-btn" onclick="deleteTopic(${t.id})">Delete</button>
                </td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}

async function addTopic() {
    const topic = document.getElementById('topicInput').value;
    const count = document.getElementById('countInput').value;
    const status = document.getElementById('statusInput').value;

    if (!topic || !count) return alert("Please fill all fields");

    const response = await fetch(`${API_URL}/add-topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count, status })
    });

    if (response.ok) {
        document.getElementById('topicInput').value = '';
        document.getElementById('countInput').value = '';
        loadTopics();
    }
}

async function deleteTopic(id) {
    if (confirm("Are you sure?")) {
        const response = await fetch(`${API_URL}/delete-topic/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) loadTopics();
    }
}

document.addEventListener('DOMContentLoaded', loadTopics);
