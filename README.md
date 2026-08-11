
# Madlerbrot set

Simple vizualization in web using JS and Wasm

[Demo](https://iviv122.github.io/MalderBrot/)

## features
- zooming
- color change
- iteration change
- explode value change

## thoughts

As reference i used [this video](ttps://www.youtube.com/watch?v=NGMRB4O922I&t=179s) and [2 parts of this acrticle](https://dev.to/foqc/mandelbrot-set-in-js-480o)

Generally speaking before research hard part was to understand ***"How i draw this?"*** for long time i couldn't understand what exactly we are drawing

Generally, we have:
Z_{n+1} = Z_n^2 + C

where z and c are imaginary numbers.

We can set recursion limit as well as explosion value. In standart madlerbrot set explosion value is 2 and Z=0.

<img width="1151" height="834" alt="Screenshot 2026-08-11 at 13 53 20" src="https://github.com/user-attachments/assets/03abf604-39c5-4cdb-8100-e4da7c1ac15a" />

so, when you see this image, black means that for given C won't explode after N iterations. While every other color means that value exploded after some iterations (aka bigger then explosion value).

## building c++ files
makefile has 3 options
- dev: assertions turned on
- main: no assertions
- low-precise: same as main but includes flags for faster float

## Technical flaws
- couldn't use long double as [em++](https://emscripten.org/) can't work with such out of the box which results in black lines when zooming
- improper use of web worker, instead it would be better to do everything in wasm while js would be used to provide input variables
- JS is singlethread and zooming might feel really unresponsible as break call won't be processed immediately
- Poor perfomance
