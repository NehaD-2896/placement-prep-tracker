let chart;

function loadChart() {
  const topics = getData("topics");

  let completed = 0, progress = 0, notStarted = 0;

  topics.forEach(t => {
    if (t.status === "Completed") completed++;
    else if (t.status === "In Progress") progress++;
    else notStarted++;
  });

  const ctx = document.getElementById("statusChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [{
        data: [completed, progress, notStarted]
      }]
    }
  });
}

loadChart();