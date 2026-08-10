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

function work() {
  if (isWorking) {
    return;
  }
  if (!moduleReady) {
    return;
  }
  isWorking = true;

  while (stack.length > 0) {
    Process_Row(stack.pop());
  }

  isWorking = false;
}

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
  stack.push(data);
  work();
};
