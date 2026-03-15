let osc, fft, reverb;
let particles = [];
let started = false;

function setup() {
  createCanvas(windowWidth, windowHeight);

  osc = new p5.Oscillator("sine");
  osc.start();
  osc.amp(0);

  fft = new p5.FFT();

  reverb = new p5.Reverb();
  reverb.process(osc, 3, 2);
}

function draw() {
  background(0, 15, 30, 35);

  let speed = dist(mouseX, mouseY, pmouseX, pmouseY);
  let freq = map(mouseY, height, 0, 220, 880);
  let amp = map(speed, 0, 20, 0.05, 0.45);
  amp = constrain(amp, 0, 0.45);

  if (mouseIsPressed) {
    userStartAudio();
    started = true;
    osc.freq(freq);
    osc.amp(amp, 0.08);

    particles.push({
      x: mouseX,
      y: mouseY,
      vx: random(-1, 1) + (mouseX - pmouseX) * 0.2,
      vy: random(-1, 1) + (mouseY - pmouseY) * 0.2,
      a: 255,
      s: random(8, 20)
    });
  } else {
    osc.amp(0, 0.2);
  }

  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.a *= 0.95;

    noStroke();
    fill(120, 220, 255, p.a);
    ellipse(p.x, p.y, p.s);
  }

  particles = particles.filter(p => p.a > 5);

  fill(255);
  textAlign(CENTER);
  textSize(20);
  text("WIND FLUTE", width / 2, 40);
  textSize(14);
  text("hold mouse and move", width / 2, 68);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}