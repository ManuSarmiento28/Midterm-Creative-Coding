let notes = {
  a: 261.63, // C4
  s: 293.66, // D4
  d: 329.63, // E4
  f: 349.23, // F4
  g: 392.0,  // G4
  h: 440.0,  // A4
  j: 493.88, // B4
  k: 523.25  // C5
};

let voices = {};
let fft;
let filter, reverb;
let sustainMode = false;

let stringWaves = [];
let keyOrder = Object.keys(notes);
let homeBtn;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // visual strings
  for (let i = 0; i < keyOrder.length; i++) {
    stringWaves.push({
      y: map(i, 0, keyOrder.length - 1, 100, height - 100),
      amp: 0,
      freq: 1,
      active: false
    });
  }

  // create one voice per note
  for (let k of keyOrder) {
    let osc1 = new p5.Oscillator("sawtooth");
    let osc2 = new p5.Oscillator("triangle");
    let noise = new p5.Noise("white");

    let env = new p5.Envelope();

    osc1.start();
    osc2.start();
    noise.start();

    osc1.amp(0);
    osc2.amp(0);
    noise.amp(0);

    let vFilter = new p5.LowPass();
    osc1.disconnect();
    osc2.disconnect();
    noise.disconnect();

    osc1.connect(vFilter);
    osc2.connect(vFilter);
    noise.connect(vFilter);

    vFilter.freq(1800);
    vFilter.res(2);

    voices[k] = {
      freq: notes[k],
      osc1,
      osc2,
      noise,
      env,
      filter: vFilter,
      held: false,
      active: false,
      vibratoOffset: random(1000)
    };
  }

  // master effect
  reverb = new p5.Reverb();

  // connect all filters to reverb
  for (let k of keyOrder) {
    reverb.process(voices[k].filter, 3, 1.8);
  }

  fft = new p5.FFT(0.85, 256);

  textAlign(CENTER, CENTER);

  // Home button
  homeBtn = createButton("Home");
  homeBtn.position(20, 20);
  homeBtn.style("padding", "8px 15px");
  homeBtn.style("background", "rgba(120, 80, 255, 0.85)");
  homeBtn.style("color", "white");
  homeBtn.style("border", "none");
  homeBtn.style("border-radius", "20px");
  homeBtn.style("cursor", "pointer");
  homeBtn.style("font-size", "14px");
  homeBtn.style("z-index", "10");
  homeBtn.mousePressed(goHome);
}

function draw() {
  background(8, 8, 25, 40);

  let spectrum = fft.analyze();
  let wave = fft.waveform();

  // brightness by mouseX
  let bright = map(mouseX, 0, width, 1200, 3200);

  let activeCount = 0;

  for (let i = 0; i < keyOrder.length; i++) {
    let k = keyOrder[i];
    let v = voices[k];
    v.filter.freq(bright);

    if (v.active) {
      activeCount++;

      let vib = sin(frameCount * 0.25 + v.vibratoOffset) * 3.5;
      v.osc1.freq(v.freq + vib);
      v.osc2.freq(v.freq * 2 + vib * 0.5);

      stringWaves[i].active = true;
      stringWaves[i].amp = lerp(stringWaves[i].amp, 26, 0.15);
      stringWaves[i].freq = map(v.freq, 261, 523, 0.9, 2.1);
    } else {
      stringWaves[i].active = false;
      stringWaves[i].amp *= 0.92;
    }
  }

  // center glow
  let mid = fft.getEnergy("mid");
  noStroke();
  fill(120, 80, 255, 25);
  ellipse(width / 2, height / 2, 220 + mid * 1.5, 220 + mid * 1.5);

  // strings
  for (let i = 0; i < stringWaves.length; i++) {
    let s = stringWaves[i];

    strokeWeight(2);

    if (s.active) {
      stroke(255, 210, 255);
    } else {
      stroke(180, 180, 255, 150);
    }

    noFill();
    beginShape();
    for (let x = 0; x <= width; x += 12) {
      let centerFalloff = sin(map(x, 0, width, 0, PI));
      let waveAmount = sin(frameCount * 0.18 * s.freq + x * 0.045) * s.amp * centerFalloff;
      curveVertex(x, s.y + waveAmount);
    }
    endShape();
  }

  stroke(255, 80);
  strokeWeight(3);
  line(80, 70, 80, height - 70);
  line(width - 80, 70, width - 80, height - 70);

  // particles
  for (let i = 0; i < spectrum.length / 8; i++) {
    let x = map(i, 0, spectrum.length / 8, 120, width - 120);
    let y = height / 2 + sin(frameCount * 0.03 + i) * 120;
    let size = map(spectrum[i], 0, 255, 2, 13);

    noStroke();
    fill(255, 120, 220, 80);
    ellipse(x, y, size, size);
  }

  // waveform
  noFill();
  stroke(120, 255, 240, 160);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let x = map(i, 0, wave.length, 80, width - 80);
    let y = map(wave[i], -1, 1, height * 0.78, height * 0.95);
    vertex(x, y);
  }
  endShape();

  // text
  noStroke();
  fill(255);
  textSize(28);
  text("DIGITAL VIOLIN STRINGS", width / 2, 45);

  textSize(16);
  text("A S D F G H J K = notes", width / 2, 78);
  text("You can press multiple keys at once", width / 2, 102);

  text("Active notes: " + activeCount, width / 2, height - 42);
}

function keyPressed() {
  let k = key.toLowerCase();
  if (!voices[k]) return;

  userStartAudio();

  let v = voices[k];
  v.held = true;
  v.active = true;

  v.osc1.freq(v.freq);
  v.osc2.freq(v.freq * 2);

  if (sustainMode) {
    v.osc1.amp(0.13, 0.12);
    v.osc2.amp(0.06, 0.12);
    v.noise.amp(0.012, 0.12);
  } else {
    v.osc1.amp(0.14, 0.03);
    v.osc2.amp(0.06, 0.03);
    v.noise.amp(0.01, 0.03);

    setTimeout(() => {
      if (!sustainMode && !v.held) {
        releaseVoice(k, 0.2);
      }
    }, 140);
  }

  let idx = keyOrder.indexOf(k);
  if (idx >= 0) {
    stringWaves[idx].amp = 30;
  }
}

function keyReleased() {
  let k = key.toLowerCase();
  if (!voices[k]) return;

  let v = voices[k];
  v.held = false;

  if (sustainMode) {
    releaseVoice(k, 0.35);
  } else {
    releaseVoice(k, 0.18);
  }
}

function mousePressed() {
  sustainMode = true;
}

function mouseReleased() {
  sustainMode = false;

  for (let k of keyOrder) {
    if (!voices[k].held) {
      releaseVoice(k, 0.25);
    }
  }
}

function releaseVoice(k, releaseTime) {
  let v = voices[k];
  v.osc1.amp(0, releaseTime);
  v.osc2.amp(0, releaseTime);
  v.noise.amp(0, releaseTime);

  setTimeout(() => {
    if (!v.held) {
      v.active = false;
    }
  }, releaseTime * 1000 + 30);
}

function goHome() {
  window.location.href = "index.html";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  for (let i = 0; i < stringWaves.length; i++) {
    stringWaves[i].y = map(i, 0, stringWaves.length - 1, 100, height - 100);
  }
}
