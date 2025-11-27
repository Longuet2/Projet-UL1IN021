var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.9;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Dimensions paddles et balle
var paddleWidth = canvas.width * 0.011;
var paddleHeight = canvas.height * 0.12;
var ballRadius = canvas.width * 0.01;
var paddleSpeed = 8;

var paddleX1 = 0;
var paddleY1 = canvas.height / 2 - paddleHeight / 2;
var paddleX2 = canvas.width - paddleWidth;
var paddleY2 = canvas.height / 2 - paddleHeight / 2;

var x = canvas.width / 2;
var y = canvas.height / 2;
var dx = 5;
var dy = -5;

// Flags boutons GPIO
var up1 = false, down1 = false, up2 = false, down2 = false;
// Flags clavier
var rightPressed = false, leftPressed = false, upPressed = false, downPressed = false;

// WebSocket pour GPIO
var ws = new WebSocket(`ws://${window.location.host}/ws`);
ws.onmessage = function(event) {
    const msg = event.data;
    if (msg === "BTN_1_pressed") up1 = true;
    if (msg === "BTN_1_released") up1 = false;
    if (msg === "BTN_2_pressed") down1 = true;
    if (msg === "BTN_2_released") down1 = false;
    if (msg === "BTN_3_pressed") up2 = true;
    if (msg === "BTN_3_released") up2 = false;
    if (msg === "BTN_4_pressed") down2 = true;
    if (msg === "BTN_4_released") down2 = false;
};

// Dessin des �l�ments
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle1() {
    ctx.beginPath();
    ctx.rect(paddleX1, paddleY1, paddleWidth, paddleHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle2() {
    ctx.beginPath();
    ctx.rect(paddleX2, paddleY2, paddleWidth, paddleHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}

// Clamp paddles � l'�cran
function clampPaddles() {
    if (paddleY1 < 0) paddleY1 = 0;
    if (paddleY1 + paddleHeight > canvas.height) paddleY1 = canvas.height - paddleHeight;
    if (paddleY2 < 0) paddleY2 = 0;
    if (paddleY2 + paddleHeight > canvas.height) paddleY2 = canvas.height - paddleHeight;
}

// Boucle principale
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBall();
    drawPaddle1();
    drawPaddle2();

    // D�placement balle
    x += dx;
    y += dy;

    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) dy = -dy;

    // Collision paddles
    if (x + dx >= canvas.width - ballRadius) {
        if (y >= paddleY2 && y <= paddleY2 + paddleHeight) {
            dx = -dx * 1.05;
            dy = dy * 1.05;
        } else {
            alert("GAME OVER");
            document.location.reload();
            return;
        }
    } else if (x + dx <= ballRadius) {
        if (y >= paddleY1 && y <= paddleY1 + paddleHeight) {
            dx = -dx * 1.05;
            dy = dy * 1.05;
        } else {
            alert("GAME OVER");
            document.location.reload();
            return;
        }
    }

    // D�placement paddles gauche
    if (up1 || leftPressed) paddleY1 -= paddleSpeed;
    if (down1 || rightPressed) paddleY1 += paddleSpeed;
    // D�placement paddles droite
    if (up2 || upPressed) paddleY2 -= paddleSpeed;
    if (down2 || downPressed) paddleY2 += paddleSpeed;

    clampPaddles();
    requestAnimationFrame(draw);
}

// Gestion clavier
document.addEventListener("keydown", function(e){
    if(e.key==="ArrowUp") upPressed=true;
    if(e.key==="ArrowDown") downPressed=true;
    if(e.key==="ArrowLeft") leftPressed=true;
    if(e.key==="ArrowRight") rightPressed=true;
});
document.addEventListener("keyup", function(e){
    if(e.key==="ArrowUp") upPressed=false;
    if(e.key==="ArrowDown") downPressed=false;
    if(e.key==="ArrowLeft") leftPressed=false;
    if(e.key==="ArrowRight") rightPressed=false;
});

// D�marrage
requestAnimationFrame(draw);
