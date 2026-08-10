var Module = {
  onRuntimeInitialized: async function () {
    moduleReady = true;
    work();
  },
};
importScripts("./lib.js");

const stack = [];
let moduleReady = false;
let isWorking = false;
let reset_id = 0;

const BATCH_SIZE = 64;

function work() {
  if (isWorking || !moduleReady) return;

  isWorking = true;
  processBatch();
}

function processBatch() {
  if (stack.length === 0) {
    isWorking = false;
    return;
  }

  for (let i = 0; i < BATCH_SIZE && stack.length > 0; i++) {
    const data = stack.pop();

    if (data.reset_id >= reset_id) {
      Process_Row(data);
    }
  }

  setTimeout(processBatch, 0);
}

async function Process_Row(data) {
  if (data.reset_id < reset_id) {
    return;
  }

  const res = new Uint32Array(data.buffer);

  await Module.processRow(
    res,
    data.width,
    data.realStart,
    data.realEnd,
    data.im,
    data.l,
    data.it,
  );

  if (data.reset_id < reset_id) {
    return;
  }

  postMessage({
    j: data.j,
    res,
    reset_id: data.reset_id,
  });
}

async function drawScreen(
  width,
  height,
  REAL_SET,
  IMAGINARY_SET,
  limit,
  iteration,
  curr_id,
  bytesPerPixel,
) {
  reset();
  for (let j = 0; j < height; j++) {
    if (curr_id < reset_id) {
      return;
    }
    const buffer = crossOriginIsolated
      ? new SharedArrayBuffer(width * bytesPerPixel)
      : new ArrayBuffer(width * bytesPerPixel);
    const data = {
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
    };
    stack.push(data);
  }
}

function reset() {
  stack.length = 0;
}

onmessage = async ({ data }) => {
  if (data.break !== undefined) {
    reset_id = data.break;
    console.log("break");
    return;
  }
  if (data.reset_id < reset_id) {
    return;
  }
  if (data.reset_id > reset_id) {
    stack.length = 0;
    reset_id = data.reset_id;
  }
  const {
    width,
    height,
    REAL_SET,
    IMAGINARY_SET,
    limit,
    iteration,
    curr_id,
    bytesPerPixel,
  } = data;
  drawScreen(
    width,
    height,
    REAL_SET,
    IMAGINARY_SET,
    limit,
    iteration,
    curr_id,
    bytesPerPixel,
  );
  work();
};
