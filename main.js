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
const max = 2;


const getColor = (n) => {
  return `rgb(0, ${(n * 5) % 256}, 0)`;
};

const setPixel = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};


function mandelbrot(cx, cy) {
  let z = { x: 0, y: 0 },
    n = 0,
    p,
    d;
  do {
    p = {
      x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
      y: 2 * z.x * z.y,
    };
    z = {
      x: p.x + cx,
      y: p.y + cy,
    };
    d = z.x * z.x + z.y * z.y;
    n += 1;
  } while (d * d <= max * max && n < iteration);
  return [n, d * d <= max * max];
}

const colors = new Array(iteration).fill(0).map((_, i) => getColor(i));
colors[0] = "#000";

const screen = Array.from({ length: height }, () => new Array(width).fill(0));

const REAL_SET = { start: -2, end: 1 };
const IMAGINARY_SET = { start: -1, end: 1 };

function draw() {
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const y = IMAGINARY_SET.start + (j / height) * (IMAGINARY_SET.end - IMAGINARY_SET.start);
      const x = REAL_SET.start + (i / width) * (REAL_SET.end - REAL_SET.start);
      const [m, isOk] = mandelbrot(x, y);
      screen[j][i] = colors[isOk ? 0 : (m % colors.length) - 1 + 1];
    }
  }
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      setPixel(i, j, screen[j][i]);
    }
  }
}
draw();
