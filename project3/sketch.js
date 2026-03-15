let tracks = ["Kick", "Snare", "Closed Hat", "Open Hat", "Clap", "Tom"];
let steps = 16;
let pattern = [];
let currentStep = -1;

let bpm = 110;
let stepDuration = 0;
let lastStepTime = 0;
let isPlaying = false;

let cellSize = 38;
let startX = 170;
let startY = 110;


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
}

function draw() {
background(18);
bpm = bpmSlider.value();
updateStepDuration();

if (isPlaying && millis() - lastStepTime >= stepDuration) {
advanceStep();
lastStepTime = millis();
}

drawUI();
drawGrid();
}

function createUI() {
homeBtn = createButton("Home");
homeBtn.position(20, 20);
homeBtn.mousePressed(goHome);

playBtn = createButton("Play / Stop");
playBtn.position(80, 20);
playBtn.mousePressed(togglePlay);

clearBtn = createButton("Clear");
clearBtn.position(180, 20);
clearBtn.mousePressed(clearPattern);

randomBtn = createButton("Random");
randomBtn.position(245, 20);
randomBtn.mousePressed(randomPattern);

bpmSlider = createSlider(60, 180, 110, 1);
bpmSlider.position(340, 22);
bpmSlider.style("width", "180px");
}

function drawUI() {
fill(255);
noStroke();
textSize(16);
textAlign(LEFT, CENTER);
text("BPM: " + bpm, 540, 30);
}

function drawGrid() {
for (let i = 0; i < tracks.length; i++) {
fill(255);
noStroke();
textSize(15);
textAlign(LEFT, CENTER);
text(tracks[i], 45, startY + i * cellSize + cellSize / 2 - 2);
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

if (j === currentStep && isPlaying) {
fill(255, 220, 120);
} else if (pattern[i][j] === 1) {
fill(0, 190, 255);
} else {
fill(55);
}
if (j % 4 === 0) {
stroke(180);
strokeWeight(1.5);
} else {
stroke(100);
strokeWeight(1);
}

rect(x, y, cellSize - 4, cellSize - 4, 6);
}}}

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
pattern[i][j] = pattern[i][j] === 0 ? 1 : 0;
}}}}

function togglePlay() {
userStartAudio();
isPlaying = !isPlaying;
}

function clearPattern() {
for (let i = 0; i < tracks.length; i++) {
for (let j = 0; j < steps; j++) {
pattern[i][j] = 0;
}}}

function randomPattern() {
for (let i = 0; i < tracks.length; i++) {
for (let j = 0; j < steps; j++) {
let chance = 0.2; 
pattern[i][j] = random() < chance ? 1 : 0;
}}}

function updateStepDuration() {
stepDuration = (60 / bpm / 4) * 1000;
}

function advanceStep() {
currentStep++;
if (currentStep >= steps) currentStep = 0;

for (let i = 0; i < tracks.length; i++) {
if (pattern[i][currentStep] === 1) {
playDrum(i);
}}}

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

function playDrum(index) {
if (index === 0) playKick();
if (index === 1) playSnare();
if (index === 2) playClosedHat();
if (index === 3) playOpenHat();
if (index === 4) playClap();
if (index === 5) playTom();
}

function playKick() {
kickOsc.freq(140);
kickOsc.amp(0.9, 0.005);

setTimeout(() => kickOsc.freq(80), 20);
setTimeout(() => kickOsc.freq(50), 50);
setTimeout(() => kickOsc.amp(0, 0.12), 60);
}

function playSnare() {
snareNoise.disconnect();

let filter = new p5.BandPass();
snareNoise.connect(filter);
filter.freq(1800);
filter.res(4);

snareNoise.amp(0.75, 0.005);
snareNoise.amp(0, 0.14);
}

function playClosedHat() {
hatNoise.disconnect();
let filter = new p5.HighPass();
hatNoise.connect(filter);
filter.freq(7000);
hatNoise.amp(0.35, 0.001);
hatNoise.amp(0, 0.04);
}

function playOpenHat() {
openHatNoise.disconnect();
let filter = new p5.HighPass();
openHatNoise.connect(filter);
filter.freq(5000);
openHatNoise.amp(0.3, 0.001);
openHatNoise.amp(0, 0.22);
}

function playClap() {
clapNoise.disconnect();
let filter = new p5.BandPass();
clapNoise.connect(filter);
filter.freq(2500);
filter.res(2);
clapNoise.amp(0.55, 0.001);

setTimeout(() => clapNoise.amp(0, 0.03), 10);
setTimeout(() => clapNoise.amp(0.45, 0.001), 25);
setTimeout(() => clapNoise.amp(0, 0.03), 45);
setTimeout(() => clapNoise.amp(0.3, 0.001), 60);
setTimeout(() => clapNoise.amp(0, 0.05), 90);
}

function playTom() {
tomOsc.freq(220);
tomOsc.amp(0.7, 0.005);
setTimeout(() => tomOsc.freq(170), 25);
setTimeout(() => tomOsc.freq(130), 55);
setTimeout(() => tomOsc.amp(0, 0.18), 70);
}

function goHome() {
window.location.href = "../index.html";
}

function windowResized() {
resizeCanvas(windowWidth, windowHeight);
}