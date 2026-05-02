async function addTopic() {
    const topic = document.getElementById('topic').value;
    const count = document.getElementById('count').value;
    const status = document.getElementById('status').value;

    const newTopic = { topic, count, status };

    // Send data to Python Backend
    const response = await fetch('http://127.0.0.1:5000/add-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopic)
    });

    if (response.ok) {
        alert("Saved to Database!");
        loadTopics(); // Refresh the table
    }
}

async function loadTopics() {
    const response = await fetch('http://127.0.0.1:5000/topics');
    const topics = await response.json();
    
    const tableBody = document.getElementById('topicTable');
    tableBody.innerHTML = ''; // Clear current table

    topics.forEach(t => {
        tableBody.innerHTML += `
            <tr>
                <td>${t.topic_name}</td>
                <td>${t.problems_solved}</td>
                <td>${t.status}</td>
                <td><button onclick="deleteTopic(${t.id})">Delete</button></td>
            </tr>`;
    });
}

// Call loadTopics when page opens
window.onload = loadTopics;
