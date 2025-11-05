// Commentaire réaliser par ChatGPT

// Récupère le canvas HTML et initialise le contexte 2D pour le dessin
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Ajuster la taille du canvas à la taille de l'écran
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight*0.9;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Position initiale de la balle (au centre horizontal et près du bas)
var x = canvas.width / 2;
var y = canvas.height / 2;

// Déplacement de la balle (vitesse sur les axes x et y)
var dx = 5
var dy = -5;

// Rayon de la balle
var ballRadius = canvas.width * 0.01;

// Dimensions des raquettes (paddles)
var paddleHeight = canvas.height * 0.12;
var paddleWidth = canvas.width * 0.011;

// Position initiale des deux raquettes
var paddleX1 = 0; // raquette gauche
var paddleX2 = canvas.width - paddleWidth; // raquette droite
var paddleY1 = canvas.height / 2 - paddleHeight / 2;
var paddleY2 = canvas.height / 2 - paddleHeight / 2;

// Variables pour savoir quelles touches sont pressées
var rightPressed = false;
var leftPressed = false;  
var upPressed = false;    
var downPressed = false;  

// Dessine la balle
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Dessine la raquette gauche
function drawPaddle1() {
  ctx.beginPath();
  ctx.rect(paddleX1, paddleY1, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Dessine la raquette droite
function drawPaddle2() {
  ctx.beginPath();
  ctx.rect(paddleX2, paddleY2, paddleWidth, paddleHeight);
  ctx.fillStyle = "#39b885ff";
  ctx.fill();
  ctx.closePath();
}

// Fonction principale du jeu, appelée à chaque intervalle
function draw() {
  // Efface le contenu précédent du canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redessine les éléments
  drawBall();
  drawPaddle1();
  drawPaddle2();

  // Déplace la balle
  x += dx;
  y += dy;

  // Fait rebondir la balle sur le haut et le bas du canvas
  if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
    dy = -dy;
  }

  // Collision paddles
  if (x + dx > canvas.width - ballRadius) {
    if (y >= paddleY2 && y <= paddleY2 + paddleHeight) {
      dx = -dx;
      dx *= 1.05; // accélération progressive
      dy *= 1.05;
    } else {
      alert("GAME OVER");
      document.location.reload();
      return;
    }
  } else if (x + dx < ballRadius) {
    if (y >= paddleY1 && y <= paddleY1 + paddleHeight) {
      dx = -dx;
      dx *= 1.05;
      dy *= 1.05;
    } else {
      alert("GAME OVER");
      document.location.reload();
      return;
    }
  }

  // Mouvement de la raquette gauche (touches flèches gauche/droite)
  if (rightPressed) {
    paddleY1 += 8; // descend
    if (paddleY1 + paddleHeight > canvas.height) {
      paddleY1 = canvas.height - paddleHeight;
    }
  } else if (leftPressed) {
    paddleY1 -= 8; // monte
    if (paddleY1 < 0) {
      paddleY1 = 0;
    }
  }

  // Mouvement de la raquette droite (touches flèches haut/bas)
  if (downPressed) {
    paddleY2 += 8; // descend
    if (paddleY2 + paddleHeight > canvas.height) {
      paddleY2 = canvas.height - paddleHeight;
    }
  } else if (upPressed) {
    paddleY2 -= 8; // monte
    if (paddleY2 < 0) {
      paddleY2 = 0;
    }
  }

  requestAnimationFrame(draw);
}

// Gestion du clavier
document.addEventListener("keydown", function(e) {
  if (e.key === "ArrowRight") rightPressed = true;
  if (e.key === "ArrowLeft") leftPressed = true;
  if (e.key === "ArrowUp") upPressed = true;
  if (e.key === "ArrowDown") downPressed = true;
});
document.addEventListener("keyup", function(e) {
  if (e.key === "ArrowRight") rightPressed = false;
  if (e.key === "ArrowLeft") leftPressed = false;
  if (e.key === "ArrowUp") upPressed = false;
  if (e.key === "ArrowDown") downPressed = false;
});

// Démarrage du jeu
requestAnimationFrame(draw);
