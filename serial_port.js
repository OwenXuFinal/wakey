let serial;
let pitch = 0;
let roll = 0;

function setup() {
  createCanvas(400, 400);

  serial = new Serial();

  let btn = createButton("Connect");
  btn.position(10, 10);
  btn.mousePressed(() => {
    serial.connectAndOpen();
  });

  serial.on("portavailable", () => {
    serial.open(serial.availablePorts[0]);
  });

  // Correct event name:
  serial.on("datareceived", serialEvent);
  serial.on("error", (err) => console.error("Serial error:", err));
}

function serialEvent() {
  let line = serial.readLine();
  if (!line) return;
  line = line.trim();
  console.log("Received:", line);

  if (line.startsWith("PITCH:")) {
    let parts = line.split(",");
    if (parts.length === 2) {
      pitch = parseFloat(parts[0].split(":")[1]);
      roll = parseFloat(parts[1].split(":")[1]);
      console.log(`Parsed pitch: ${pitch}, roll: ${roll}`);
    }
  }
}

function draw() {
  let tilt = constrain(sqrt(pitch * pitch + roll * roll), 0, 30);
  let r = map(tilt, 0, 30, 0, 255);
  let g = map(tilt, 0, 30, 255, 0);
  background(r, g, 0);

  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(`Pitch: ${pitch.toFixed(1)}°`, width / 2, height / 2 - 30);
  text(`Roll: ${roll.toFixed(1)}°`, width / 2, height / 2);
  text(`Tilt: ${tilt.toFixed(1)}°`, width / 2, height / 2 + 30);
}
