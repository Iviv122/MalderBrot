var Module = {
  onRuntimeInitialized: function () {
    moduleReady = true;
    while (queue.length > 0) {
      Process_Row(queue.shift());
    }
  },
};
importScripts("./lib.js");

const queue = [];
let moduleReady = false;

function Process_Row(data) {
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
  postMessage({ j: data.j, res: res });
}

onmessage = ({ data }) => {
  if (!moduleReady) {
    queue.push(data);
    return;
  }
  Process_Row(data);
};
