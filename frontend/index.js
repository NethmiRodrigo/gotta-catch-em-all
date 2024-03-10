
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
    let protocolString = 'ws://' + ipAddress + ':' + portNumber
    websocket = new WebSocket(protocolString);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function doDisconnect() {
    websocket.close();
}

function onOpen(evt) {
  document.getElementById("connectButton").disabled = true;
  document.getElementById("disconnectButton").disabled = false;

  document.getElementById("connectionStatus").innerHTML = "";
  var alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-success");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = "<strong>Status:</strong> Successfully connected to the server";
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

function onClose(evt) {
  document.getElementById("connectButton").disabled = false;
  document.getElementById("disconnectButton").disabled = true;

  document.getElementById("connectionStatus").innerHTML = "";
  var alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = "<strong>Status:</strong> Disconnected from the server"; 
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

function onMessage(evt) {
    var obj = JSON.parse(evt.data);
    console.log(obj);

    var trace1 = {
        x: obj.Time_stamp,
        y: obj.RSSI,
        type: 'scatter'
    };

    var trace2 = {
        x: obj.Time_stamp,
        y: obj.Link_q,
        type: 'scatter'
    };

    var layout1 = {
            
        yaxis: {
            title:'dBm',
            type: 'log',
            mode:'lines',
            autorange: true
        },
                
        title: 'Received Signal Strength Indicator (RSSI)'
    };
  
    var layout2 = {
            
        yaxis: {
            title: 'CSI',
            type: 'log',
            mode:'lines',
            autorange: true
        },
                
        title: 'Channel State Information (CSI) - [1 out of 256 parameters]'
    };

    var charData1 = [trace1];
    Plotly.newPlot('content',charData1,layout1);

    var charData2 = [trace2];
    Plotly.newPlot('content2',charData2,layout2);

    detectedActivity = obj.detected_activity;
    updateClassification()

}

function onError(evt) {
  websocket.close();

  document.getElementById("connectButton").disabled = false;
  document.getElementById("disconnectButton").disabled = true;

  document.getElementById("connectionStatus").innerHTML = "";
  var alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", "alert-danger");
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = "<strong>Status:</strong> Something went wrong - " + evt.data + "\n"; 
  document.getElementById("connectionStatus").appendChild(alertDiv);
}

function doSend(message) {
    websocket.send('');
}

window.addEventListener("load", init, false);

const interval = setInterval(function() {	
    const date = new Date();
    doSend(date)
    }, 500);


//############################################################
// Activity labeling
//############################################################

var currentActivity = "none";
var activitySelectionEnabled = false;
var activityDetectionEnabled = false;
var detectedActivity = "none";

function activitySelected(activityID) {
    if (activitySelectionEnabled === true) {
	switch(activityID){
		case 1:
			currentActivity = "SittingArmsUp";
			break;
		case 2:
        		currentActivity = "SittingArmsDown";
			break;
		case 3:
    			currentActivity = "StandingArmsUp";
			break;
		case 4:
    			currentActivity = "StandingArmsDown";
			break;
		case 5:
			currentActivity = "Kneeling";
			break;
		case 6:
        		currentActivity = "WalkingForwardLOS";
			break;
		case 7:
    			currentActivity = "WalkingBackwardLOS";
			break;
		case 8:
    			currentActivity = "WalkingAcrossLOS";
			break;
		case 9:
			currentActivity = "Movement"
			break;
		case 10:
			currentActivity = "none"

	}	
    	console.log(currentActivity); 

        var activityStatus = {
                    "action": 'nodetect',
		    "currentActivity": currentActivity
        }
        websocket.send(JSON.stringify(activityStatus));        
    }
}

function enableActivitySelection() {
    let checkStatus = document.getElementById('enableActivitySelection').checked;
    if (checkStatus === true) {
        console.log("Checked");
        activitySelectionEnabled = true;
    } else {
        console.log("Not checked");
        activitySelectionEnabled = false;
    }
}

//############################################################
// Activity detection
//############################################################


function detectionSelected() {
    if (activityDetectionEnabled === true) {
    	action = "detect";
	    var activityStatus = {
                    "action": action,
  		    "currentActivity": 'none' 
	    }
	    websocket.send(JSON.stringify(activityStatus));
    }
}


function detectionDeselected() {
    if (activityDetectionEnabled === false) {
    	action = "nodetect";
	    var activityStatus = {
                    "action": action,
  		    "currentActivity": 'none' 
	    }
	    websocket.send(JSON.stringify(activityStatus));
    }
}

function updateClassification() {
    if (activityDetectionEnabled === true) {
        document.getElementById("classificationResult").innerHTML = "";
        var alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-success");
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = "<strong>Classification:</strong> " + detectedActivity; 
        document.getElementById("classificationResult").appendChild(alertDiv);
    }
}


function enableActivityDetection() {
    let checkStatus = document.getElementById('enableActivityDetection').checked;
    if (checkStatus === true) {
	activityDetectionEnabled = true;
	detectionSelected();

        document.getElementById("classificationResult").innerHTML = "";
        var alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-success");
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = "<strong>Classification:</strong> [Classification]"; 
        document.getElementById("classificationResult").appendChild(alertDiv);

    } else {
	activityDetectionEnabled = false;
	detectionDeselected();

        document.getElementById("classificationResult").innerHTML = "";
        var alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-danger");
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = "<strong>Classification:</strong> No Classification"; 
        document.getElementById("classificationResult").appendChild(alertDiv);
    }
}
