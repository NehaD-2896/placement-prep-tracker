function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
if (!localStorage.getItem("goalHistory")) {
  localStorage.setItem("goalHistory", JSON.stringify([]));
}