let websocket;
let voxel = 0;
let interVoxel = 0;
let startedRecording = false;
let mode = "";
let activity = "";

// Call the init function when the page has loaded
window.addEventListener("load", init, false);

// Init function to inject the banner that displays the server connection status
function init() {
  document.getElementById("connectButton").disabled = false;
  document.getElementById("disconnectButton").disabled = true;

  document.getElementById("connectionStatus").innerHTML = "";
  let alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = "<strong>Status:</strong> Disconnected from the server";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

// Function that creates a web socket to connect to the server.
// Called when the "Connect" button is clicked.
function doConnect() {
  let ipAddress = document.getElementById("ip-address").value;
  let portNumber = document.getElementById("port-number").value;
  let protocolString = "ws://" + ipAddress + ":" + portNumber;
  websocket = new WebSocket(protocolString);
  websocket.onopen = function (evt) {
    onOpen(evt);
  };
  websocket.onclose = function (evt) {
    onClose(evt);
  };
  websocket.onmessage = function (evt) {
    onMessage(evt);
  };
  websocket.onerror = function (evt) {
    onError(evt);
  };
}

// To handle the opening of a web socket.
function onOpen(evt) {
  document.getElementById("connectButton").disabled = true;
  document.getElementById("disconnectButton").disabled = false;

  document.getElementById("connectionStatus").innerHTML = "";
  let alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-success");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML =
    "<strong>Status:</strong> Successfully connected to the server";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

// Handles the closing of the web socket
function onClose(evt) {
  startedRecording = false;
  document.getElementById("connectButton").disabled = false;
  document.getElementById("disconnectButton").disabled = true;

  document.getElementById("connectionStatus").innerHTML = "";
  let alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = "<strong>Status:</strong> Disconnected from the server";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

function onError(evt) {
  websocket.close();
  startedRecording = false;

  document.getElementById("connectButton").disabled = false;
  document.getElementById("disconnectButton").disabled = true;

  document.getElementById("connectionStatus").innerHTML = "";
  let alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML =
    "<strong>Status:</strong> Something went wrong - " + evt.data + "\n";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

function sendDataToServer() {
  let data = {
    activity: activity,
    voxel: voxel,
    interVoxel: interVoxel,
    mode: mode,
  };

  websocket.send(JSON.stringify(data));

  console.log("sending data to server", data);
}

// To handle whenever a voxel button is clicked
function buttonClicked(button, type) {
  button.disabled = true;

  let className = "";
  if (type == "voxel") {
    voxel = button.id.match(/\d+/)[0];
    className = ".voxel-grid-btn";
  } else if (type == "inter-voxel") {
    interVoxel = button.id.match(/\d+/)[0];
    className = ".inter-voxel-grid-btn";
  }

  let buttons = document.querySelectorAll(className);
  buttons.forEach(function (btn) {
    if (btn !== button) {
      btn.disabled = false;
    }
  });

  if (startedRecording) sendDataToServer();
}

function startRecording(btn) {
  if (websocket == null) {
    alert("Not connected to server");
    return;
  }

  if (activity == "" || mode == null || voxel == 0 || interVoxel == 0) {
    alert("All inputs must be selected");
    return;
  }

  btn.disabled = true;
  startedRecording = true;

  let stopRecordingBtn = document.getElementById("stop-recording");
  stopRecordingBtn.disabled = false;

  if (mode == "stop") {
    mode = document.getElementById("mode").value;
  }

  sendDataToServer();
}

function stopRecording(btn) {
  btn.disabled = true;
  startedRecording = false;

  let startRecordingBtn = document.getElementById("start-recording");
  startRecordingBtn.disabled = false;

  mode = "stop";
  sendDataToServer();
}

function onChangeActivity(state) {
  activity = state.value;
  if (startedRecording) sendDataToServer();
}

function onChangeMode(state) {
  mode = state.value;
  if (startedRecording) sendDataToServer();
}
