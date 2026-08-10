var Module = {
  onRuntimeInitialized: async function () {
    moduleReady = true;
    while (queue.length > 0) {
      Process_Row(queue.shift());
    }
  },
};
importScripts("./lib.js");

const queue = [];
let moduleReady = false;
let reset_id = 0;

async function Process_Row(data) {
  if (data.reset_id < reset_id) {
    return;
  }
  const res = new Uint32Array(data.buffer);
  Module.processRow(
    res,
    data.j,
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
  postMessage({ j: data.j, res: res, reset_id: data.reset_id });
}

async function reset() {
  queue.length = 0;
}

onmessage = async ({ data }) => {
  if (data.reset_id < reset_id) {
    return;
  }
  reset_id = data.reset_id;
  if (!moduleReady) {
    queue.push(data);
    return;
  }
  Process_Row(data);
};
