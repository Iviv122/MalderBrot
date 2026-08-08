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

const getColor = (val) => {
  return `rgb(0, ${val%256}, ${val%256})`;
};

const clear = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
}

const setPixel = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

let REAL_SET = { start: -2, end: 1 };
let IMAGINARY_SET = { start: -1, end: 1 };

const worker = new Worker("worker.js");

worker.addEventListener("message", ({ data }) => {
  const res = new Uint32Array(data.res);
  for (let x = 0; x < width; x++) {
    if (res[x] > 0) {
      setPixel(x, data.j, getColor(res[x]));
    }
  }
});


const bytesPerPixel = Uint32Array.BYTES_PER_ELEMENT;
function compute_row(j) {
  const buffer = crossOriginIsolated
    ? new SharedArrayBuffer(width * bytesPerPixel)
    : new ArrayBuffer(width * bytesPerPixel);

  worker.postMessage({
    buffer,
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
  clear()
  for (let i = 0; i < height; i++) {
    compute_row(i);
  }
}

draw();

let ZOOM_FACTOR = 0;

canvas.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) {
    ZOOM_FACTOR = 0.1;
  } else {
    ZOOM_FACTOR = 2;
  }
  const zfw = width * ZOOM_FACTOR;
  const zfh = height * ZOOM_FACTOR;

  REAL_SET = {
    start: getRelativePoint(e.pageX - zfw, width, REAL_SET),
    end: getRelativePoint(e.pageX + zfw, width, REAL_SET),
  };
  IMAGINARY_SET = {
    start: getRelativePoint(e.pageY - zfh, height, IMAGINARY_SET),
    end: getRelativePoint(e.pageY + zfh, height, IMAGINARY_SET),
  };

  clear()
  draw();
});

const getRelativePoint = (pixel, length, set) =>
  set.start + (pixel / length) * (set.end - set.start);
