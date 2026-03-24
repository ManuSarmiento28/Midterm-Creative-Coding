let tracks = ["Kick", "Snare", "Closed Hat", "Open Hat", "Clap", "Tom"];
let steps = 16;
let pattern = [];
let currentStep = -1;

let bpm = 110;
let stepDuration = 0;
let lastStepTime = 0;
let isPlaying = false;

let cellSize = 40;
let startX = 0;
let startY = 0;
let gridW = 0;
let gridH = 0;
let labelWidth = 120;

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

  drawTitle();
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

  positionControls();
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

function positionControls() {
  let topY = 30;
  let controlsStartX = width / 2 - 250;

  homeBtn.position(controlsStartX, topY);
  playBtn.position(controlsStartX + 80, topY);
  clearBtn.position(controlsStartX + 200, topY);
  randomBtn.position(controlsStartX + 280, topY);
  bpmSlider.position(controlsStartX + 380, topY + 5);
}

function updateLayout() {
  gridW = steps * cellSize;
  gridH = tracks.length * cellSize;

  // center the whole sequencer block:
  // labels + grid together
  let totalSequencerWidth = labelWidth + gridW;
  startX = (width - totalSequencerWidth) / 2 + labelWidth;
  startY = (height - gridH) / 2;

  positionControls();
}

function drawTitle() {
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);

  textSize(28);
  text("DRUM SEQUENCER", width / 2, startY - 90);

  textSize(15);
  fill(200);
  text("Click each square to cycle volume: 0 → 1 → 2 → 3 → 0", width / 2, startY - 60);

  fill(255);
  textAlign(LEFT, CENTER);
  text("BPM: " + bpm, bpmSlider.x + 190, bpmSlider.y + 8);
}

function drawGrid() {
  // track labels
  for (let i = 0; i < tracks.length; i++) {
    fill(255);
    noStroke();
    textSize(15);
    textAlign(RIGHT, CENTER);
    text(tracks[i], startX - 16, startY + i * cellSize + cellSize / 2);
  }

  // step numbers
  for (let j = 0; j < steps; j++) {
    fill(180);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text(j + 1, startX + j * cellSize + cellSize / 2 - 2, startY - 18);
  }

  // cells
  for (let i = 0; i < tracks.length; i++) {
    for (let j = 0; j < steps; j++) {
      let x = startX + j * cellSize;
      let y = startY + i * cellSize;
      let level = pattern[i][j];

      if (level === 0) {
        fill(50);
      } else if (level === 1) {
        fill(90, 170, 255);
      } else if (level === 2) {
        fill(255, 180, 70);
      } else if (level === 3) {
        fill(255, 80, 80);
      }

      if (j === currentStep && isPlaying) {
        stroke(255);
        strokeWeight(3);
      } else if (j % 4 === 0) {
        stroke(160);
        strokeWeight(1.5);
      } else {
        stroke(95);
        strokeWeight(1);
      }

      rect(x, y, cellSize - 4, cellSize - 4, 6);

      if (level > 0) {
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(15);
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
        return;
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
      if (chance < 0.65) {
        pattern[i][j] = 0;
      } else if (chance < 0.8) {
        pattern[i][j] = 1;
      } else if (chance < 0.92) {
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
  let amp = levelAmp(level, 0.22, 0.5, 0.95);
  kickOsc.freq(140);
  kickOsc.amp(amp, 0.005);
  setTimeout(() => kickOsc.freq(80), 20);
  setTimeout(() => kickOsc.freq(50), 50);
  setTimeout(() => kickOsc.amp(0, 0.12), 60);
}

function playSnare(level) {
  let amp = levelAmp(level, 0.18, 0.42, 0.8);

  snareNoise.disconnect();
  let filter = new p5.BandPass();
  snareNoise.connect(filter);
  filter.freq(1800);
  filter.res(4);

  snareNoise.amp(amp, 0.005);
  snareNoise.amp(0, 0.14);
}

function playClosedHat(level) {
  let amp = levelAmp(level, 0.08, 0.18, 0.34);

  hatNoise.disconnect();
  let filter = new p5.HighPass();
  hatNoise.connect(filter);
  filter.freq(7000);

  hatNoise.amp(amp, 0.001);
  hatNoise.amp(0, 0.04);
}

function playOpenHat(level) {
  let amp = levelAmp(level, 0.08, 0.17, 0.3);

  openHatNoise.disconnect();
  let filter = new p5.HighPass();
  openHatNoise.connect(filter);
  filter.freq(5000);

  openHatNoise.amp(amp, 0.001);
  openHatNoise.amp(0, 0.22);
}

function playClap(level) {
  let amp1 = levelAmp(level, 0.14, 0.28, 0.5);
  let amp2 = levelAmp(level, 0.1, 0.22, 0.38);
  let amp3 = levelAmp(level, 0.06, 0.15, 0.26);

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
  let amp = levelAmp(level, 0.18, 0.4, 0.72);
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
