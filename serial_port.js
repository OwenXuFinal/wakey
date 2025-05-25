let msg = "Not connected";
let serialOptions = { baudRate: 9600 };
let serial;
let isConnected = false;

let pitch = 0;
let roll = 0;
let alert = false;

function setup() {
  createCanvas(500, 200);
  background(100);
  textFont('Courier New');
  textSize(20);

  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
}

function draw() {
  background(alert ? 'red' : 50);
  fill(alert ? 'white' : 'lime');
  text(msg, 20, 40);

  fill(255);
  textSize(16);
  text(`Pitch: ${pitch.toFixed(2)}`, 20, 80);
  text(`Roll: ${roll.toFixed(2)}`, 20, 110);
}

function mouseClicked() {
  if (!isConnected) {
    isConnected = connectPort();
  }
}

async function connectPort() {
  if (!serial.isOpen()) {
    await serial.connectAndOpen(null, serialOptions);
  } else {
    serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);
  }
}

function onSerialConnectionOpened(eventSender) {
  console.log("Serial connection opened");
  msg = "🌈 Connected!";
}

function onSerialConnectionClosed(eventSender) {
  console.log("Serial connection closed");
  msg = "Connection Closed!";
  isConnected = false;
}

function onSerialErrorOccurred(eventSender, error) {
  console.error("Serial error", error);
  msg = "Serial Error Occurred!";
}

function onSerialDataReceived(eventSender, newData) {
  newData = newData.trim();
  console.log("Received:", newData);

  if (newData === "ALERT") {
    alert = true;
    msg = "!!! ALERT !!!";
  } else if (newData.startsWith("PITCH:")) {
    // Parse PITCH:<value>,ROLL:<value>
    let parts = newData.split(",");
    if (parts.length === 2) {
      let pitchPart = parts[0].split(":");
      let rollPart = parts[1].split(":");
      if (pitchPart.length === 2 && rollPart.length === 2) {
        pitch = parseFloat(pitchPart[1]);
        roll = parseFloat(rollPart[1]);
        alert = false;
        msg = `Pitch: ${pitch.toFixed(2)}, Roll: ${roll.toFixed(2)}`;
      }
    }
  } else {
    msg = "Received: " + newData;
  }
}
