// quick_example.cpp
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <emscripten/bind.h>

using namespace emscripten;

uint32_t mandelbrot(double cx, double cy, double max, int it) {
  double zx = 0;
  double zy = 0;
  double px = 0;
  double py = 0;
  int n = 0;
  double d;
  do {
    px = pow(zx, 2) - pow(zy, 2);
    py = 2 * zx * zy;
    zx = px + cx;
    zy = py + cy;

    d = zx * zx + zy * zy;
    n += 1;
  } while (d <= max * max && n < it);
  return d <= max * max ? 0 : n;
};

void processRow(val buffer, int j, int width, double realStart, double realEnd,
                double im, double l, int it) {
  for (size_t x = 0; x < width; x++) {
    buffer.set(
        x, mandelbrot(realStart + ((double)x / width) * (realEnd - realStart),
                      im, l, it));
  }
}

EMSCRIPTEN_BINDINGS(my_module) {
  function("mandelbrot", &mandelbrot);
  function("processRow", &processRow);
}
