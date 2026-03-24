let tracks = ["Kick", "Snare", "Closed Hat", "Open Hat", "Clap", "Tom"];
let steps = 16;
let pattern = [];
let currentStep = -1;

let bpm = 110;
let stepDuration = 0;
let lastStepTime = 0;
let isPlaying = false;

let cellSize = 38;
let startX = 0;
let startY = 0;
let gridW = 0;
let gridH = 0;

let homeBtn, playBtn, clearBtn, randomBtn, bpmSlider;

// sounds
let kickOsc, tomOsc;
let snareNoise, hatNoise, openHatNoise, clapNoise;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");

  for (let i = 0; i < tracks.length; i++) {
    pattern[i] = [];
    for (let j = 0; j < steps; j++) {
      pattern[i][j] = 0;
    }
  }

  createDrums();
  createUI();
  updateStepDuration();
  updateLayout();
}

function draw() {
  background(18);
  bpm = bpmSlider.value();
  updateStepDuration();

  if (isPlaying && millis() - lastStepTime >= stepDuration) {
    advanceStep();
    lastStepTime = millis();
  }

  updateLayout();
  drawUI();
  drawGrid();
}

function createUI() {
  homeBtn = createButton("Home");
  homeBtn.mousePressed(goHome);

  playBtn = createButton("Play / Stop");
  playBtn.mousePressed(togglePlay);

  clearBtn = createButton("Clear");
  clearBtn.mousePressed(clearPattern);

  randomBtn = createButton("Random");
  randomBtn.mousePressed(randomPattern);

  bpmSlider = createSlider(60, 180, 110, 1);
  bpmSlider.style("width", "180px");

  styleButton(homeBtn);
  styleButton(playBtn);
  styleButton(clearBtn);
  styleButton(randomBtn);
}

function styleButton(btn) {
  btn.style("padding", "8px 14px");
  btn.style("background", "#111");
  btn.style("color", "white");
  btn.style("border", "1px solid #666");
  btn.style("border-radius", "8px");
  btn.style("cursor", "pointer");
  btn.style("font-size", "14px");
}

function updateLayout() {
  gridW = steps * cellSize;
  gridH = tracks.length * cellSize;

  let labelArea = 120;
  let topArea = 90;

  startX = (width - gridW) / 2 + labelArea / 2;
  startY = (height - gridH) / 2 + topArea / 2;

  let controlsY = startY - 60;
  let totalControlsWidth = 520;
  let controlsStartX = (width - totalControlsWidth) / 2;

  homeBtn.position(controlsStartX, controlsY);
  playBtn.position(controlsStartX + 70, controlsY);
  clearBtn.position(controlsStartX + 180, controlsY);
  randomBtn.position(controlsStartX + 250, controlsY);
  bpmSlider.position(controlsStartX + 340, controlsY + 4);
}

function drawUI() {
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);

  textSize(28);
  text("DRUM SEQUENCER", width / 2, startY - 105);

  textSize(16);
  text("Click a square to change its volume", width / 2, startY - 82);

  textSize(14);
  text("1 = low   2 = medium   3 = high   4th click = off", width / 2, startY - 62);

  textAlign(LEFT, CENTER);
  text("BPM: " + bpm, bpmSlider.x + 190, bpmSlider.y + 8);
}

function drawGrid() {
  for (let i = 0; i < tracks.length; i++) {
    fill(255);
    noStroke();
    textSize(15);
    textAlign(RIGHT, CENTER);
    text(tracks[i], startX - 18, startY + i * cellSize + cellSize / 2 - 2);
  }

  for (let j = 0; j < steps; j++) {
    fill(200);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text(j + 1, startX + j * cellSize + cellSize / 2 - 2, startY - 20);
  }

  for (let i = 0; i < tracks.length; i++) {
    for (let j = 0; j < steps; j++) {
      let x = startX + j * cellSize;
      let y = startY + i * cellSize;
      let level = pattern[i][j];

      if (j === currentStep && isPlaying) {
        if (level === 0) {
          fill(255, 220, 120);
        } else if (level === 1) {
          fill(80, 200, 255);
        } else if (level === 2) {
          fill(0, 170, 255);
        } else {
          fill(0, 120, 255);
        }
      } else {
        if (level === 0) {
          fill(55);
        } else if (level === 1) {
          fill(90, 170, 255);
        } else if (level === 2) {
          fill(30, 140, 255);
        } else {
          fill(0, 95, 230);
        }
      }

      if (j % 4 === 0) {
        stroke(180);
        strokeWeight(1.5);
      } else {
        stroke(100);
        strokeWeight(1);
      }

      rect(x, y, cellSize - 4, cellSize - 4, 6);

      if (level > 0) {
        noStroke();
        fill(255);
        textSize(12);
        textAlign(CENTER, CENTER);
        text(level, x + (cellSize - 4) / 2, y + (cellSize - 4) / 2 + 1);
      }
    }
  }
}

function mousePressed() {
  userStartAudio();

  for (let i = 0; i < tracks.length; i++) {
    for (let j = 0; j < steps; j++) {
      let x = startX + j * cellSize;
      let y = startY + i * cellSize;

      if (
        mouseX > x &&
        mouseX < x + cellSize - 4 &&
        mouseY > y &&
        mouseY < y + cellSize - 4
      ) {
        pattern[i][j] = (pattern[i][j] + 1) % 4;
      }
    }
  }
}

function togglePlay() {
  userStartAudio();
  isPlaying = !isPlaying;
}

function clearPattern() {
  for (let i = 0; i < tracks.length; i++) {
    for (let j = 0; j < steps; j++) {
      pattern[i][j] = 0;
    }
  }
}

function randomPattern() {
  for (let i = 0; i < tracks.length; i++) {
    for (let j = 0; j < steps; j++) {
      let chance = random();
      if (chance < 0.68) {
        pattern[i][j] = 0;
      } else if (chance < 0.82) {
        pattern[i][j] = 1;
      } else if (chance < 0.93) {
        pattern[i][j] = 2;
      } else {
        pattern[i][j] = 3;
      }
    }
  }
}

function updateStepDuration() {
  stepDuration = (60 / bpm / 4) * 1000;
}

function advanceStep() {
  currentStep++;
  if (currentStep >= steps) currentStep = 0;

  for (let i = 0; i < tracks.length; i++) {
    let level = pattern[i][currentStep];
    if (level > 0) {
      playDrum(i, level);
    }
  }
}

function createDrums() {
  kickOsc = new p5.Oscillator("sine");
  kickOsc.start();
  kickOsc.amp(0);

  tomOsc = new p5.Oscillator("triangle");
  tomOsc.start();
  tomOsc.amp(0);

  snareNoise = new p5.Noise("white");
  snareNoise.start();
  snareNoise.amp(0);

  hatNoise = new p5.Noise("white");
  hatNoise.start();
  hatNoise.amp(0);

  openHatNoise = new p5.Noise("white");
  openHatNoise.start();
  openHatNoise.amp(0);

  clapNoise = new p5.Noise("white");
  clapNoise.start();
  clapNoise.amp(0);
}

function playDrum(index, level) {
  if (index === 0) playKick(level);
  if (index === 1) playSnare(level);
  if (index === 2) playClosedHat(level);
  if (index === 3) playOpenHat(level);
  if (index === 4) playClap(level);
  if (index === 5) playTom(level);
}

function levelAmp(level, low, mid, high) {
  if (level === 1) return low;
  if (level === 2) return mid;
  return high;
}

function playKick(level) {
  let amp = levelAmp(level, 0.35, 0.6, 0.9);

  kickOsc.freq(140);
  kickOsc.amp(amp, 0.005);

  setTimeout(() => kickOsc.freq(80), 20);
  setTimeout(() => kickOsc.freq(50), 50);
  setTimeout(() => kickOsc.amp(0, 0.12), 60);
}

function playSnare(level) {
  let amp = levelAmp(level, 0.25, 0.5, 0.75);

  snareNoise.disconnect();

  let filter = new p5.BandPass();
  snareNoise.connect(filter);
  filter.freq(1800);
  filter.res(4);

  snareNoise.amp(amp, 0.005);
  snareNoise.amp(0, 0.14);
}

function playClosedHat(level) {
  let amp = levelAmp(level, 0.12, 0.23, 0.35);

  hatNoise.disconnect();
  let filter = new p5.HighPass();
  hatNoise.connect(filter);
  filter.freq(7000);
  hatNoise.amp(amp, 0.001);
  hatNoise.amp(0, 0.04);
}

function playOpenHat(level) {
  let amp = levelAmp(level, 0.12, 0.22, 0.3);

  openHatNoise.disconnect();
  let filter = new p5.HighPass();
  openHatNoise.connect(filter);
  filter.freq(5000);
  openHatNoise.amp(amp, 0.001);
  openHatNoise.amp(0, 0.22);
}

function playClap(level) {
  let amp1 = levelAmp(level, 0.2, 0.38, 0.55);
  let amp2 = levelAmp(level, 0.15, 0.3, 0.45);
  let amp3 = levelAmp(level, 0.1, 0.2, 0.3);

  clapNoise.disconnect();
  let filter = new p5.BandPass();
  clapNoise.connect(filter);
  filter.freq(2500);
  filter.res(2);
  clapNoise.amp(amp1, 0.001);

  setTimeout(() => clapNoise.amp(0, 0.03), 10);
  setTimeout(() => clapNoise.amp(amp2, 0.001), 25);
  setTimeout(() => clapNoise.amp(0, 0.03), 45);
  setTimeout(() => clapNoise.amp(amp3, 0.001), 60);
  setTimeout(() => clapNoise.amp(0, 0.05), 90);
}

function playTom(level) {
  let amp = levelAmp(level, 0.25, 0.48, 0.7);

  tomOsc.freq(220);
  tomOsc.amp(amp, 0.005);
  setTimeout(() => tomOsc.freq(170), 25);
  setTimeout(() => tomOsc.freq(130), 55);
  setTimeout(() => tomOsc.amp(0, 0.18), 70);
}

function goHome() {
  window.location.href = "../index.html";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}
}

function windowResized() {
resizeCanvas(windowWidth, windowHeight);
}
