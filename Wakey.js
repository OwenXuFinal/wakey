let msg = "PLEASE CONNECT WAKERMAN";
let serialOptions = { baudRate: 9600 };
let serial;
let isConnected = false;
let anger = false;
let voice
let voicePlayed = false;

let pitch = 0;
let roll = 0;

let greenColor, orangeColor, redColor, grayColor;

let angerStartTime = null;
const angerDelay = 5000;

function preload() {
    voice = loadSound('Wakey.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Courier New');
  textSize(60);

  greenColor = color(0, 200, 0);
  orangeColor = color(255, 165, 0);
  redColor = color(255, 0, 0);
  grayColor = color(100);

  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
}

function draw() {
  let maxVal = Math.max(Math.abs(pitch), Math.abs(roll));

  if (maxVal > 30) {
    if (angerStartTime === null) {
      angerStartTime = millis();
    } else {
      if (millis() - angerStartTime >= angerDelay) {
        anger = true;
      }
    }
  } else {
    angerStartTime = null;
  }

  if (anger) {
    maxVal = 30;
  }

  let mouthOffset = map(maxVal, 0, 30, 0, 60);
  mouthOffset = constrain(mouthOffset, 0, 60);

  let eyebrowRotation = 0;
  if (maxVal > 10) {
    eyebrowRotation = map(maxVal, 10, 30, 0, PI / 6);
    eyebrowRotation = constrain(eyebrowRotation, 0, PI / 6);
  }

  if (anger) {
    background(redColor);
  if (!voicePlayed) {
    voice.play();
    voicePlayed = true;
  }
  } else {
    background('lightBlue');
  if (voice.isPlaying()) {
    voice.stop();
  }
  voicePlayed = false;
  }
  
  textSize(30);
  fill('white');
  textAlign(LEFT, TOP);
  text(msg, 20, 20);

  fill(BgColor(maxVal));
  noStroke();
  ellipse(width / 2, height / 2, 800, 800);

  fill('white');
  ellipse(width / 2 - 150, height / 2 - 125, 150, 150);
  ellipse(width / 2 + 150, height / 2 - 125, 150, 150);

  fill('black');
  ellipse(width / 2 - 150, height / 2 - 125, 80, 80);
  ellipse(width / 2 + 150, height / 2 - 125, 80, 80);

  push();
  translate(width / 2 - 150, height / 2 - 200);
  rotate(eyebrowRotation);
  fill('black');
  rectMode(CENTER);
  rect(0, 0, 200, 20, 10);
  pop();

  push();
  translate(width / 2 + 150, height / 2 - 200);
  rotate(-eyebrowRotation);
  fill('black');
  rectMode(CENTER);
  rect(0, 0, 200, 20, 10);
  pop();

  push();
  fill('black');
  translate(width / 2, height / 2 + 50 + mouthOffset);
  rectMode(CENTER);
  rect(0, 0, 300 + mouthOffset * 3, 50);
  pop();

  if (anger) {
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(80);
    text("!!! IM DISAPPOINTED IN YOU !!!", width / 2, height / 2);

    let buttonText = "I'm Sorry";
    textSize(50);
    fill('white');
    textAlign(CENTER, CENTER);
    let buttonX = width / 2;
    let buttonY = height - 60;
    text(buttonText, buttonX, buttonY);

    buttonBounds = {
      x: buttonX - textWidth(buttonText) / 2,
      y: buttonY - 20,
      w: textWidth(buttonText),
      h: 40,
    };
  }
}

function BgColor(val) {
  let absVal = Math.abs(val);

  if (absVal <= 10) {
    return greenColor;
  } else if (absVal <= 20) {
    let amt = map(absVal, 10, 20, 0, 1);
    return lerpColor(greenColor, orangeColor, amt);
  } else if (absVal <= 30) {
    let amt = map(absVal, 20, 30, 0, 1);
    return lerpColor(orangeColor, redColor, amt);
  } else {
    return redColor;
  }
}

function mouseClicked() {
  if (!isConnected) {
    isConnected = connectPort();
  }

  if (anger) {
    if (
      mouseX >= buttonBounds.x &&
      mouseX <= buttonBounds.x + buttonBounds.w &&
      mouseY >= buttonBounds.y &&
      mouseY <= buttonBounds.y + buttonBounds.h
    ) {
      anger = false;
      msg = "Please connect Wakerman";
    }
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
  msg = "Connected!";
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

  if (newData.startsWith("PITCH:")) {
    let parts = newData.split(",");
    if (parts.length === 2) {
      let pitchPart = parts[0].split(":");
      let rollPart = parts[1].split(":");
      if (pitchPart.length === 2 && rollPart.length === 2) {
        pitch = parseFloat(pitchPart[1]);
        roll = parseFloat(rollPart[1]);
        msg = `Pitch: ${pitch.toFixed(2)}, Roll: ${roll.toFixed(2)}`;
      }
    }
  } else {
    msg = "Received: " + newData;
  }
}
