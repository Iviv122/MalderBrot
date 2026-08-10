const canvas = document.getElementById("canvas");
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d", { alpha: false });

const width = window.innerWidth;
const height = window.innerHeight;

ctx.canvas.width = width;
ctx.canvas.height = height;
canvas.width = width;
canvas.height = height;

const iteration = 128;
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
});

const bytesPerPixel = Uint32Array.BYTES_PER_ELEMENT;

async function draw(curr_id) {
  worker.postMessage({
    width,
    height,
    REAL_SET,
    IMAGINARY_SET,
    limit,
    iteration,
    curr_id,
    bytesPerPixel,
  });
}

let ZOOM_FACTOR = 0;

function zoom(e, zoom_factor) {
  e.preventDefault();
  reset_id++;
  worker.postMessage({ break: reset_id });
  clear();

  const zfw = width * zoom_factor;
  const zfh = height * zoom_factor;

  REAL_SET = {
    start: getRelativePoint(e.pageX - zfw, width, REAL_SET),
    end: getRelativePoint(e.pageX + zfw, width, REAL_SET),
  };

  IMAGINARY_SET = {
    start: getRelativePoint(e.pageY - zfh, height, IMAGINARY_SET),
    end: getRelativePoint(e.pageY + zfh, height, IMAGINARY_SET),
  };

  draw(reset_id);
}

canvas.addEventListener("mouseup", (e) => {
  switch (e.button) {
    case 0:
      zoom(e, 0.1);
      break;
    case 2:
      zoom(e, 2);
      break;
  }
});
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

canvas.addEventListener("wheel", async (e) => {
  if (e.deltaY > 0) {
    zoom(e, 0.1);
  } else {
    zoom(e, 2);
  }
});

const getRelativePoint = (pixel, length, set) =>
  set.start + (pixel / length) * (set.end - set.start);
