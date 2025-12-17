var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Noms des joueurs depuis la page d'accueil
var joueur1 = localStorage.getItem('joueur1') || 'Joueur 1';
var joueur2 = localStorage.getItem('joueur2') || 'Joueur 2';

// Mettre à jour le scoreboard
document.getElementById("player1Name").textContent = joueur1;
document.getElementById("player2Name").textContent = joueur2;

let paused = false;
const PAUSE_TIME = 1000; // 1 seconde

// Dimensions et positions
var paddleWidth, paddleHeight, ballRadius;
var paddleSpeed = 8;
var paddleX1 = 0, paddleY1;
var paddleX2, paddleY2;
var x, y, dx, dy;

// Flags boutons
var up1 = false, down1 = false;
var up2 = false, down2 = false;
var upPressed1 = false, downPressed1 = false;
var upPressed2 = false, downPressed2 = false;

// WebSocket
var ws = new WebSocket(`ws://${window.location.host}/ws`);
let animationId;

// --- Redimensionnement ---
function resizeCanvas() {
    const scoreboardHeight = document.getElementById('scoreboard').offsetHeight;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - scoreboardHeight; 

    paddleWidth = canvas.width * 0.011;
    paddleHeight = canvas.height * 0.12;
    ballRadius = canvas.width * 0.01;

    paddleY1 = (canvas.height - paddleHeight)/2;
    paddleY2 = (canvas.height - paddleHeight)/2;
    paddleX2 = canvas.width - paddleWidth;

    resetBall();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// --- Initialisation balle ---
function resetBall() {
    x = canvas.width / 2;
    y = canvas.height / 2;
    let speed = 5;
    dx = Math.random() < 0.5 ? speed : -speed;
    dy = Math.floor(Math.random() * (speed * 2 + 1)) - speed; 
}

// --- WebSocket ---
ws.onmessage = function(event) {
    const msg = event.data;
    if (msg === "BTN_2_pressed") up1 = true;
    if (msg === "BTN_2_released") up1 = false;
    if (msg === "BTN_1_pressed") down1 = true;
    if (msg === "BTN_1_released") down1 = false;
    if (msg === "BTN_4_pressed") up2 = true;
    if (msg === "BTN_4_released") up2 = false;
    if (msg === "BTN_3_pressed") down2 = true;
    if (msg === "BTN_3_released") down2 = false;
};

// --- Dessins ---
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

function drawPaddle1() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(paddleX1, paddleY1, paddleWidth, paddleHeight);
}

function drawPaddle2() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(paddleX2, paddleY2, paddleWidth, paddleHeight);
}

// --- Clamp ---
function clampPaddles() {
    paddleY1 = Math.max(0, Math.min(paddleY1, canvas.height - paddleHeight));
    paddleY2 = Math.max(0, Math.min(paddleY2, canvas.height - paddleHeight));
}

var score_1 = 0;
var score_2 = 0;

// --- Fonction pour sauvegarder la partie dans la base de données ---
async function saveGameToDatabase() {
    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                player1_name: joueur1,
                player2_name: joueur2,
                player1_score: score_1,
                player2_score: score_2
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('Partie sauvegardée avec succès ! ID:', data.game_id);
        } else {
            console.error('Erreur lors de la sauvegarde:', data.error);
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
    }
}

// --- Fin de partie ---
function gameOver() {
    cancelAnimationFrame(animationId);
    
    // Sauvegarder la partie dans la base de données
    saveGameToDatabase();
    
    // Afficher les scores dans l'overlay
    const scoreElements = document.querySelectorAll("#gameOverOverlay #score1, #gameOverOverlay #score2");
    scoreElements[0].textContent = score_1;
    scoreElements[1].textContent = score_2;
    
    document.getElementById("gameOverOverlay").style.display = "block";
}


function pauseAfterGoal() {
    paused = true;

    // stoppe le mouvement
    dx = 0;
    dy = 0;

    setTimeout(() => {
        resetBall();
        paused = false;
    }, PAUSE_TIME);
}

// --- Boucle de jeu ---
function draw() {         
    animationId = requestAnimationFrame(draw);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    document.getElementById("score1").textContent = score_1
    document.getElementById("score2").textContent = score_2
    
    drawBall();
    drawPaddle1();
    drawPaddle2();

    x += dx;
    y += dy;

    if (paused) {
        drawBall();
        drawPaddle1();
        drawPaddle2();
        return;
    }
    
    // Collisions haut/bas
    if (y - ballRadius <= 0 || y + ballRadius >= canvas.height) dy = -dy;

    // Collision paddle droite
    if (x + ballRadius >= paddleX2) {
        if (y >= paddleY2 && y <= paddleY2 + paddleHeight) {
            dx = -dx * 1.05;
            dy *= 1.05;
            ws.send("sound_bounce");
        } else {
            ws.send("sound_goal");
            score_1++;
            pauseAfterGoal();
            return;
        }
    }

    // Collision paddle gauche
    if (x - ballRadius <= paddleX1 + paddleWidth) {
        if (y >= paddleY1 && y <= paddleY1 + paddleHeight) {
            dx = -dx * 1.05;
            dy *= 1.05;
            ws.send("sound_bounce");
        } else {
            ws.send("sound_goal");
            score_2++;
            pauseAfterGoal();
            return;
        }
    }

    // Déplacement paddles
    if (up1) paddleY1 -= paddleSpeed;
    if (down1) paddleY1 += paddleSpeed;
    if (up2) paddleY2 -= paddleSpeed;
    if (down2) paddleY2 += paddleSpeed;

    if (upPressed1) paddleY1 -= paddleSpeed;
    if (downPressed1) paddleY1 += paddleSpeed;
    if (upPressed2) paddleY2 -= paddleSpeed;
    if (downPressed2) paddleY2 += paddleSpeed;

    clampPaddles();

    if (score_1 === 11 || score_2 === 11) {
        gameOver();
        return;
    }
}

// --- Clavier ---
document.addEventListener("keydown", e => {
    if (e.key === "z") upPressed1 = true;
    if (e.key === "s") downPressed1 = true;
    if (e.key === "ArrowUp") upPressed2 = true;
    if (e.key === "ArrowDown") downPressed2 = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "z") upPressed1 = false;
    if (e.key === "s") downPressed1 = false;
    if (e.key === "ArrowUp") upPressed2 = false;
    if (e.key === "ArrowDown") downPressed2 = false;
});

// --- Boutons Rejouer / Quitter ---
document.getElementById("replayBtn").addEventListener("click", () => {
    document.getElementById("gameOverOverlay").style.display = "none";
    score_1 = 0;
    score_2 = 0;
    paddleY1 = (canvas.height - paddleHeight)/2;
    paddleY2 = (canvas.height - paddleHeight)/2;
    resetBall();
    draw();
});

document.getElementById("quitBtn").addEventListener("click", () => {
    window.location.href = "/";
});

// --- Start ---
draw()
