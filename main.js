const canvas = document.getElementById("canvas");
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d", { alpha: false });

const width = window.innerWidth;
const height = window.innerHeight;

ctx.canvas.width = width;
ctx.canvas.height = height;
canvas.width = width;
canvas.height = height;

const iteration = 256;
const limit = 2;
let reset_id = 0;

var Module = {
  onRuntimeInitialized: function () {
    draw(reset_id);
  },
};

const colors = new Array(256)
  .fill(0)
  .map((_, val) => `rgb(0, ${val % 256}, ${val % 256})`);

const clear = async () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
};

const drawLine = async (off, x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(off, y, x, 1);
};

let REAL_SET = { start: -2, end: 1 };
let IMAGINARY_SET = { start: -1, end: 1 };

const worker = new Worker("worker.js");

worker.addEventListener("message", async ({ data }) => {
  if (data.reset_id !== reset_id) {
    return;
  }

  const res = new Uint32Array(data.res);

  let w = 1;
  let off = 0;
  let last = res[0];

  for (let x = 1; x < width; x++) {
    if (res[x] === last) {
      w++;
    } else {
      if (res[x - 1] > 0) {
        drawLine(off, w, data.j, colors[res[x - 1] % colors.length]);
      }

      off += w;
      w = 1;
      last = res[x];
    }
  }

  // Draw the final run.
  if (res[width - 1] > 0) {
    drawLine(off, w, data.j, colors[res[width - 1] % colors.length]);
  }
});

const bytesPerPixel = Uint32Array.BYTES_PER_ELEMENT;

async function compute_row(j, curr_id) {
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
    reset_id: curr_id,
  });
}

async function draw(curr_id) {
  for (let i = 0; i < height; i += 1) {
    if (reset_id !== curr_id) {
      return;
    }
    compute_row(i, curr_id);
  }
}

let ZOOM_FACTOR = 0;

canvas.addEventListener("wheel", async (e) => {
  e.preventDefault();
  reset_id++;
  clear();

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

  draw(reset_id);
});

const getRelativePoint = (pixel, length, set) =>
  set.start + (pixel / length) * (set.end - set.start);
