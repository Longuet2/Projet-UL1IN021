var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var x = canvas.width / 2;
var y = canvas.height - 30;
var dx = 1;
var dy = -1;
var ballRadius = 10;
var interval = setInterval(draw, 10);

var paddleHeight = 75;
var paddleWidth = 10;
var paddleX1 = 0;
var paddleX2 = canvas.width - paddleWidth;
var paddleY1 = canvas.height/2 - paddleHeight/2
var paddleY2 = canvas.height/2 - paddleHeight/2
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle1() {
  ctx.beginPath();
  ctx.rect(paddleX1, paddleY1, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle2() {
  ctx.beginPath();
  ctx.rect(paddleX2, paddleY2, paddleWidth, paddleHeight);
  ctx.fillStyle = "#39b885ff";
  ctx.fill();
  ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle1();
    drawPaddle2();
    x += dx;
    y += dy;
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }
    
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        if (x >= paddleX2 && x <= paddleX2+paddleWidth && y >= paddleY2 && y <= paddleY2 + paddleHeight) {
            dx = -dx;
        } else if (x <= paddleX1 + paddleWidth && x >= paddleX1 && y >= paddleY1 && y <= paddleY1 + paddleHeight) {
            dx = -dx;
        
        }else {
            alert("GAME OVER");
            document.location.reload();
            clearInterval(interval);
        }
        
    }
    if (rightPressed) {
        paddleY1 += 4;
        if (paddleY1 + paddleHeight > canvas.height) {
            paddleY1 = canvas.height - paddleHeight;
        }
        } else if (leftPressed) {
        paddleY1 -= 4;
        if (paddleY1 < 0) {
            paddleY1 = 0;
        }
    }
    if (downPressed) {
        paddleY2 += 4;
        if (paddleY2 + paddleHeight > canvas.height) {
            paddleY2 = canvas.height - paddleHeight;
        }
        } else if (upPressed) {
        paddleY2 -= 4;
        if (paddleY2 < 0) {
            paddleY2 = 0;
        }
    }
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
  if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = true;
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    downPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
  if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = false;
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    downPressed = false;
  }
}

