const dpr = window.devicePixelRatio;
const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
const height = window.innerHeight|| document.documentElement.clientHeight ||document.body.clientHeight;

const canvas = document.getElementById("canvas");
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d",{alpha : false});

canvas.width = width * dpr;
canvas.height = height * dpr;

ctx.strokeStyle = "green";
ctx.beginPath()
ctx.moveTo(0, 0)
ctx.lineTo(width, height);
ctx.lineWidth = 10
ctx.stroke()

const setPixel = (x, y, color) => {
  x = (width / 2 + x)
  y = (height / 2 + y)
  ctx.fillStyle = color
  ctx.fillRect(x, y, 1, 1);
}


for (let i = -5; i <= 5; i++) {
  for (let j = -5; j <= 5; j++) {
    setPixel(i, j, "red")
  }
}

let z = 0
