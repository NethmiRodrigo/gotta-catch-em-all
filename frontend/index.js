var websocket;

function init() {
  document.getElementById("connectButton").disabled = false;
  document.getElementById("disconnectButton").disabled = true;

  document.getElementById("connectionStatus").innerHTML = "";
  var alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = "<strong>Status:</strong> Disconnected from the server";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

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

function doDisconnect() {
  startRecording = false;
  websocket.close();
}

function onOpen(evt) {
  document.getElementById("connectButton").disabled = true;
  document.getElementById("disconnectButton").disabled = false;

  document.getElementById("connectionStatus").innerHTML = "";
  var alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-success");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML =
    "<strong>Status:</strong> Successfully connected to the server";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

function onClose(evt) {
  startRecording = false;
  document.getElementById("connectButton").disabled = false;
  document.getElementById("disconnectButton").disabled = true;

  document.getElementById("connectionStatus").innerHTML = "";
  var alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = "<strong>Status:</strong> Disconnected from the server";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

function onError(evt) {
  websocket.close();
  startRecording = false;

  document.getElementById("connectButton").disabled = false;
  document.getElementById("disconnectButton").disabled = true;

  document.getElementById("connectionStatus").innerHTML = "";
  var alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML =
    "<strong>Status:</strong> Something went wrong - " + evt.data + "\n";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

window.addEventListener("load", init, false);

var voxel = 0;
var interVoxel = 0;
var startedRecording = false;
var mode = "";
var activity = "";

function buttonClicked(button, type) {
  var buttons = document.querySelectorAll(".grid-btn");
  buttons.forEach(function (btn) {
    if (btn !== button) {
      btn.disabled = false;
    }
  });
  button.disabled = true;

  if (type == "voxel") voxel = button.id.match(/\d+/)[0];
  else if (type == "inter-voxel") interVoxel = button.id.match(/\d+/)[0];

  var data = {
    activity: activity,
    voxel: voxel,
    interVoxel: interVoxel,
    mode: mode,
  };

  if (startedRecording) {
    websocket.send(JSON.stringify(data));
  }
}

function startRecording(btn) {
  if (websocket == null) {
    alert("Not connected to server");
    return;
  }

  var stopRecording = document.getElementById("stop-recording");
  stopRecording.disabled = false;

  btn.disabled = true;
  startedRecording = true;

  activity = document.getElementById("activity").value;
  mode = document.getElementById("mode").value;

  if (activity == "" || mode == null || voxel == 0 || interVoxel == 0) {
    alert("All inputs must be selected");
  }

  var data = {
    activity: activity,
    voxel: voxel,
    interVoxel: interVoxel,
    mode: mode,
  };

  websocket.send(JSON.stringify(data));
}

function stopRecording(btn) {
  var startRecording = document.getElementById("start-recording");

  var data = {
    mode: "stop",
  };

  websocket.send(JSON.stringify(data));

  btn.disabled = true;
  startRecording.disabled = false;
  startedRecording = false;
}
