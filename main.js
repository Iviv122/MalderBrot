const canvas = document.getElementById("canvas");
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d", { alpha: false });

const width = window.innerWidth;
const height = window.innerHeight;
ctx.canvas.width = width;
ctx.canvas.height = height;

canvas.width = width;
canvas.height = height;

const iteration = 200;
const limit = 2;

const getColor = (n) => {
  return `rgb(0, ${(n / iteration) * 256}, 0)`;
};

const setPixel = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

const colors = new Array(iteration).fill(0).map((_, i) => getColor(i));
colors[0] = "#000";

const REAL_SET = { start: -2, end: 1 };
const IMAGINARY_SET = { start: -1, end: 1 };

const sendToWorker = (i, j, cx, cy, max, it) => {
  worker.postMessage({ i, j, cx, cy, max, it });
};

function ComputePixel(j, i) {
  sendToWorker(
    i,
    j,
    REAL_SET.start + (i / width) * (REAL_SET.end - REAL_SET.start),
    IMAGINARY_SET.start +
      (j / height) * (IMAGINARY_SET.end - IMAGINARY_SET.start),
    limit,
    iteration,
  );
}

function compute_row(j) {
  for (let i = 0; i < width; i++) {
    ComputePixel(j, i);
  }
}

function draw() {
  for (let i = 0; i < height; i++) {
    compute_row(i);
  }
}
const worker = new Worker("worker.js");
worker.addEventListener("message", (msg) => {
  setPixel(
    msg.data.x,
    msg.data.y,
    colors[msg.data.isOk ? 0 : (msg.data.m % colors.length) - 1 + 1],
  );
});
draw();
