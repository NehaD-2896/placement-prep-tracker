/* ---------- Utility Functions ---------- */
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ---------- Topics Section ---------- */
function addTopic() {
  const topic = document.getElementById("topic").value.trim();
  const count = document.getElementById("count").value;
  const status = document.getElementById("status").value;

  if (!topic || !count) return;

  const topics = getData("topics");
  topics.push({ topic, count: Number(count), status });
  saveData("topics", topics);

  document.getElementById("topic").value = "";
  document.getElementById("count").value = "";

  displayTopics();
  loadChart();
  updatePrepScore();
}

function displayTopics() {
  const table = document.getElementById("topicTable");
  table.innerHTML = "";

  const topics = getData("topics");

  topics.forEach((t, index) => {
    table.innerHTML += `
      <tr>
        <td>${t.topic}</td>
        <td>
          <input type="number" value="${t.count}"
            onchange="updateCount(${index}, this.value)">
        </td>
        <td>
          <select onchange="updateStatus(${index}, this.value)">
            <option ${t.status === "Not Started" ? "selected" : ""}>Not Started</option>
            <option ${t.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${t.status === "Completed" ? "selected" : ""}>Completed</option>
          </select>
        </td>
        <td>
          <button onclick="deleteTopic(${index})">🗑</button>
        </td>
      </tr>
    `;
  });
}

function updateCount(index, value) {
  const topics = getData("topics");
  topics[index].count = Number(value);
  saveData("topics", topics);
  loadChart();
}

function updateStatus(index, status) {
  const topics = getData("topics");
  topics[index].status = status;
  saveData("topics", topics);
  displayTopics();
  loadChart();
  updatePrepScore();
}

function deleteTopic(index) {
  const topics = getData("topics");
  topics.splice(index, 1);
  saveData("topics", topics);
  displayTopics();
  loadChart();
  updatePrepScore();
}

/* ---------- Prep Score ---------- */
function calculateScore() {
  const topics = getData("topics");
  if (topics.length === 0) return 0;

  let total = 0;
  topics.forEach(t => {
    if (t.status === "Completed") total += 100;
    else if (t.status === "In Progress") total += 50;
  });

  return Math.round(total / topics.length);
}

function updatePrepScore() {
  document.getElementById("prepScore").innerText =
    calculateScore() + "%";
}

/* ---------- Daily Goal & Streak ---------- */
function completeGoal() {
  const goal = document.getElementById("goalInput").value.trim();

  if (goal === "") {
    alert("Please enter today's goal");
    return;
  }

  const today = new Date().toDateString();
  const lastDate = localStorage.getItem("lastGoalDate");
  let streak = Number(localStorage.getItem("streak")) || 0;

  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastDate === yesterday) {
    streak += 1;
  } else if (lastDate !== today) {
    streak = 1;
  }

  localStorage.setItem("todayGoal", goal);
  localStorage.setItem("lastGoalDate", today);
  localStorage.setItem("streak", streak);

  const history = getData("goalHistory");

  if (!history.includes(today)) {
    history.push(today);
    saveData("goalHistory", history);
  }

  document.getElementById("goalInput").value = "";

  displayGoal();
  renderWeek();
}

function displayGoal() {
  const goal = localStorage.getItem("todayGoal");
  const streak = localStorage.getItem("streak") || 0;

  document.getElementById("goalText").innerText =
    goal ? `Today's Goal: ${goal}` : "No goal set today";

  document.getElementById("streakText").innerText =
    `Current Streak: ${streak} days`;
}

/* ---------- Weekly Tracker ---------- */
function renderWeek() {
  const history = getData("goalHistory");
  const weekDiv = document.getElementById("week");

  if (!weekDiv) return;

  weekDiv.innerHTML = "";

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dayStr = date.toDateString();
    const done = history.includes(dayStr);

    const dayName = date.toLocaleDateString("en-US", {
      weekday: "short"
    });

    weekDiv.innerHTML += `
      <span class="day ${done ? "done" : "missed"}">
        ${dayName}
      </span>
    `;
  }
}

/* ---------- Initial Load ---------- */
displayTopics();
displayGoal();
updatePrepScore();
renderWeek();
