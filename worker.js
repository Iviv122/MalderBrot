const mandelbrot = (cx, cy,max,it) => {
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
  } while (d  <= max * max && n < it);
  return [n, d  <= max * max];
}

onmessage = (e) => {
  const [m,is] = mandelbrot(e.data.cx,e.data.cy,e.data.max,e.data.it)
  const res = {
    x: e.data.i,
    y: e.data.j,
    m: m,
    is: is
  }
  postMessage(res)
}
