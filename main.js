const canvas = document.getElementById("canvas");
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d", { alpha: false });

const width = window.innerWidth;
const height = window.innerHeight;

ctx.canvas.width = width;
ctx.canvas.height = height;
canvas.width = width;
canvas.height = height;

let iteration = 256;
let explode_value = 2;
let reset_id = 0;
let power = 2;

let r = 0;
let g = 15;
let b = 1;

var Module = {
  onRuntimeInitialized: function () {
    draw(reset_id);
  },
};

function getColor(val) {
  return `rgb(${(val * r) % 256}, ${(val * g) % 256}, ${(val * b) % 256})`;
}

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
let ZOOM_FACTOR = 0;

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
        drawLine(off,w,data.j,getColor(res[x - 1]))
      }

      off += w;
      w = 1;
      last = res[x];
    }
  }
});

const bytesPerPixel = Uint32Array.BYTES_PER_ELEMENT;

async function draw_new() {
  reset_id += 1;
  draw(reset_id);
}

async function draw(curr_id) {
  clear();
  worker.postMessage({
    width,
    height,
    REAL_SET,
    IMAGINARY_SET,
    limit: explode_value,
    iteration,
    curr_id,
    bytesPerPixel,
  });
}

function zoom(e, zoom_factor) {
  e.preventDefault();
  reset_id++;
  worker.postMessage({ break: reset_id });

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
      zoom(e, 1.5);
      break;
  }
});
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

canvas.addEventListener("wheel", async (e) => {
  if (e.deltaY > 0) {
    zoom(e, 0.4);
  } else {
    zoom(e, 1.1);
  }
});

const getRelativePoint = (pixel, length, set) =>
  set.start + (pixel / length) * (set.end - set.start);

const iteration_slider = document.getElementById("iter");
iteration_slider.value = iteration;
iteration_slider.addEventListener("input", (e) => {
  iteration = e.target.value;
  draw_new();
});

const explode_slider = document.getElementById("explode");
explode_slider.value = explode_value;
explode_slider.addEventListener("input", (e) => {
  explode_value = e.target.value;
  draw_new();
});

const r_slider = document.getElementById("r");
r_slider.value = r;
r_slider.addEventListener("input", (e) => {
  r = e.target.value;
  draw_new();
});

const g_slider = document.getElementById("g");
g_slider.value = g;
g_slider.addEventListener("input", (e) => {
  g = e.target.value;
  draw_new();
});

const b_slider = document.getElementById("b");
b_slider.value = b;
b_slider.addEventListener("input", (e) => {
  b = e.target.value;
  draw_new();
});

function reset_pos() {
  iteration = 256;
  explode_value = 2;
  ZOOM_FACTOR = 0;
  REAL_SET = { start: -2, end: 1 };
  IMAGINARY_SET = { start: -1, end: 1 };

  ctx.canvas.width = width;
  ctx.canvas.height = height;
  canvas.width = width;
  canvas.height = height;

  explode_slider.value = explode_value;
  iteration_slider.value = iteration;

  draw_new();
}
