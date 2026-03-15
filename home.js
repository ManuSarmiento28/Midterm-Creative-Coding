let stars = [];
let x, y;
let dx = 3;
let dy = 2;
let title = "AUDIO SPACE";

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas-holder");

  x = width / 2;
  y = height / 2;

  for (let i = 0; i < 90; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      vx: random(-1, 1),
      vy: random(-1, 1),
      size: random(2, 4)
    });
  }

  textAlign(CENTER, CENTER);
  textFont("Arial");
  noCursor();
}

function draw() {
  background(5, 5, 20);

  drawGlow();
  updateStars();
  drawConnections();
  moveTitle();
  drawTitle();
  drawMouseEffect();
}

function drawGlow() {
  noStroke();

  fill(255, 0, 170, 30);
  ellipse(width * 0.2, height * 0.3, 260, 260);

  fill(0, 220, 255, 30);
  ellipse(width * 0.8, height * 0.4, 320, 320);

  fill(255, 230, 0, 18);
  ellipse(width * 0.5, height * 0.75, 220, 220);
}

function updateStars() {
  noStroke();

  for (let s of stars) {
    let d = dist(s.x, s.y, mouseX, mouseY);

    if (d < 120) {
      let angle = atan2(s.y - mouseY, s.x - mouseX);
      s.x += cos(angle) * 1.5;
      s.y += sin(angle) * 1.5;
    }

    s.x += s.vx;
    s.y += s.vy;

    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    fill(255);
    circle(s.x, s.y, s.size);
  }
}

function drawConnections() {
  strokeWeight(1);

  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      let d = dist(stars[i].x, stars[i].y, stars[j].x, stars[j].y);

      if (d < 110) {
        stroke(255, 255, 255, 30);
        line(stars[i].x, stars[i].y, stars[j].x, stars[j].y);
      }
    }
  }

  for (let s of stars) {
    let dm = dist(s.x, s.y, mouseX, mouseY);

    if (dm < 130) {
      stroke(0, 220, 255, 60);
      line(s.x, s.y, mouseX, mouseY);
    }
  }
}

function moveTitle() {
  x += dx;
  y += dy;

  textSize(72);
  let w = textWidth(title) / 2;
  let h = 40;

  if (x + w > width || x - w < 0) {
    dx *= -1;
  }

  if (y + h > height || y - h < 0) {
    dy *= -1;
  }
}

function drawTitle() {
  textSize(72);

  fill(255, 0, 170);
  text(title, x + 4, y + 4);

  fill(0, 220, 255);
  text(title, x - 4, y - 4);

  fill(255);
  text(title, x, y);
}

function drawMouseEffect() {
  noFill();

  stroke(255, 255, 255, 120);
  circle(mouseX, mouseY, 20);

  stroke(0, 220, 255, 80);
  circle(mouseX, mouseY, 45);

  stroke(255, 0, 170, 60);
  circle(mouseX, mouseY, 70);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}