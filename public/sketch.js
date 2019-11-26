let socket;
let color = "#000";
let strokeWidth = 4;
let cv;
let lastStrokeTime = Date.now();
let websocket = new WebSocket("wss://arch7210-fall2019.coditect.com/pablo");
let prevTime = Date.now();
let timeDif = 50;
function pixToInch(point, cWidth, cHeight, outWidth, outHeight) {
  let px = ((point[0] - cWidth) / cWidth) * outWidth;
  let py = ((point[1] - cHeight) / cHeight) * outHeight;
  return [px, py];
}
function setup() {
  // Creating canvas
  cv = createCanvas(windowWidth / 2, windowHeight / 2);
  centerCanvas();
  cv.background(255, 255, 255);

  // Start the socket connection
  socket = io.connect("http://localhost:3000");

  // Callback function
  socket.on("mouse", data => {
    stroke(data.color);
    strokeWeight(data.strokeWidth);
    line(data.x, data.y, data.px, data.py);
  });

  // Getting our buttons and the holder through the p5.js dom
  const color_picker = select("#pickcolor");
  const color_btn = select("#color-btn");
  const color_holder = select("#color-holder");

  const stroke_width_picker = select("#stroke-width-picker");
  const stroke_btn = select("#stroke-btn");

  // Adding a mousePressed listener to the button
  color_btn.mousePressed(() => {
    // Checking if the input is a valid hex color
    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color_picker.value())) {
      color = color_picker.value();
      color_holder.style("background-color", color);
    } else {
      console.log("Enter a valid hex value");
    }
  });

  // Adding a mousePressed listener to the button
  stroke_btn.mousePressed(() => {
    const width = parseInt(stroke_width_picker.value());
    if (width > 0) strokeWidth = width;
  });
}

function windowResized() {
  centerCanvas();
  cv.resizeCanvas(windowWidth / 2, windowHeight / 2, false);
}

function centerCanvas() {
  const x = (windowWidth - width) / 2;
  const y = (windowHeight - height) / 2;
  cv.position(x, y);
}

function mouseDragged() {
  // Draw
  let currentStrokeTime = Date.now();
  stroke(color);
  strokeWeight(strokeWidth);
  line(mouseX, mouseY, pmouseX, pmouseY);

  // Send the mouse coordinates
  if (currentStrokeTime - lastStrokeTime > 1) {
    sendmouse(mouseX, mouseY, pmouseX, pmouseY);
    lastStrokeTime = Date.now();
  }
}

// Sending data to the socket
function sendmouse(x, y, pX, pY) {
  const data = {
    x: x,
    y: y,
    px: pX,
    py: pY,
    color: color,
    strokeWidth: strokeWidth
  };
  console.log(data);
  let command = {
    method: "goto",
    params: pixToInch([pX, pY], windowWidth / 2, windowHeight / 2, 10, 10),
    id: "command_1"
  };
  if (Date.now() - prevTime > timeDif) {
    websocket.send(JSON.stringify(command));
    prevTime = Date.now();
  }

  socket.emit("mouse", data);
}
