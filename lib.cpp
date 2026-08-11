#include <cstddef>
#include <cstdint>
#include <emscripten/bind.h>
using namespace emscripten;


// todo, julia, you try z and set c
// im, the same as mandelbrot but c is const
// and z is var

// replace with pow in case of what xd
inline uint32_t mandelbrot(double cx, double cy, double max, int it) {
  double zx = 0;
  double zy = 0;
  double px = 0;
  double py = 0;
  uint32_t n = 0;
  double d;
  do {
    px = zx * zx - zy * zy;
    py = 2 * zx * zy;
    zx = px + cx;
    zy = py + cy;

    d = zx * zx + zy * zy;
    n += 1;
  } while (d <= max * max && n < it);
  return n;
};

void processRow(val buffer, int width, double realStart, double realEnd,
                double im, double l, int it) {
  for (size_t x = 0; x < width; x++) {
    buffer.set(x, mandelbrot(realStart + ((double)x / (double)width) *
                                             (realEnd - realStart),
                             im, l, it));
  }
}


EMSCRIPTEN_BINDINGS(my_module) {
  function("mandelbrot", &mandelbrot);
  function("processRow", &processRow);
}
