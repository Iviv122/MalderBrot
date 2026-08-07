const canvas = document.getElementById("canvas");
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d", { alpha: false });
const width = window.innerWidth;
const height = window.innerHeight;
ctx.canvas.width = width;
ctx.canvas.height = height;
canvas.width = width;
canvas.height = height;

const iteration = 1000;
const limit = 2;

const getColor = (n) => {
  return `rgb(0, ${(n / iteration) * 256}, 0)`;
};

const setPixel = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

const colors = new Array(iteration).fill(0).map((_, i) => getColor(i));

const REAL_SET = { start: -2, end: 1 };
const IMAGINARY_SET = { start: -1, end: 1 };

const worker = new Worker("worker.js");
worker.addEventListener("message", ({ data }) => {
  data.res.forEach((v, i) => {
    setPixel(i, data.j, colors[v[1] ? 0 : (v[0] % colors.length) - 1 + 1]);
  });
});

function compute_row(j) {
  worker.postMessage({
    j,
    width,
    realStart: REAL_SET.start,
    realEnd: REAL_SET.end,
    im:
      IMAGINARY_SET.start +
      (j / height) * (IMAGINARY_SET.end - IMAGINARY_SET.start),
    l: limit,
    it: iteration,
  });
}

function draw() {
  for (let i = 0; i < height; i++) {
    compute_row(i);
  }
}

draw();
