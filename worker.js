const mandelbrot = (cx, cy, max, it) => {
  let zx = 0;
  let zy = 0;
  let px = 0;
  let py = 0;
  let n = 0,
    d;
  do {
    px = Math.pow(zx, 2) - Math.pow(zy, 2);
    py = 2 * zx * zy;
    zx = px + cx;
    zy = py + cy;

    d = zx * zx + zy * zy;
    n += 1;
  } while (d <= max * max && n < it);
  return d <= max * max ? 0 : n;
};

onmessage = ({ data }) => {
  const res = new Uint32Array(data.buffer);
  for (let x = 0; x < data.width; x++) {
    res[x] = mandelbrot(
      data.realStart + (x / data.width) * (data.realEnd - data.realStart),
      data.im,
      data.l,
      data.it,
    );
  }
  postMessage({ j: data.j, res: res });
};
