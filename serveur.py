import asyncio
import threading
import time
import RPi.GPIO as GPIO

from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from pydantic import BaseModel
import uvicorn

from database import PongDatabase


# Initialisation de l'application FastAPI
app = FastAPI()

# Gestion des templates HTML et des fichiers statiques
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialisation de la base de données SQLite
db = PongDatabase()


# Modèle utilisé pour valider les scores reçus depuis le client
class GameScore(BaseModel):
    player1_name: str
    player2_name: str
    player1_score: int
    player2_score: int


# Pages HTML
@app.get("/", response_class=HTMLResponse)
def acceuil(request: Request):
    return templates.TemplateResponse("acceuil.html", {"request": request})

@app.get("/jeu", response_class=HTMLResponse)
def pong(request: Request):
    return templates.TemplateResponse("jeu_pong.html", {"request": request})

@app.get("/historique", response_class=HTMLResponse)
def historique(request: Request):
    return templates.TemplateResponse("historique.html", {"request": request})


# Retourne l’historique complet des parties
@app.get("/api/games")
def get_games():
    games = db.get_all_games()
    return JSONResponse(content=games)

# Ajoute une partie dans la base de données
@app.post("/api/games")
def add_game(game: GameScore):
    try:
        game_id = db.add_game(
            player1_name=game.player1_name,
            player2_name=game.player2_name,
            player1_score=game.player1_score,
            player2_score=game.player2_score
        )
        return JSONResponse(content={"success": True, "game_id": game_id})
    except Exception as e:
        return JSONResponse(
            content={"success": False, "error": str(e)},
            status_code=400
        )


# Liste des clients WebSocket connectés
websockets = set()

# WebSocket utilisé pour la communication temps réel avec le jeu
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    websockets.add(ws)

    try:
        while True:
            msg = await ws.receive_text()
            await handle_client_message(msg)
    except:
        pass
    finally:
        websockets.discard(ws)


# Définition des boutons GPIO et du buzzer
BUTTONS = {
    5: "BTN_1",
    16: "BTN_2",
    24: "BTN_3",
    22: "BTN_4"
}
BUZZER_PIN = 26

GPIO.setmode(GPIO.BCM)

# Configuration des boutons en entrée avec pull-up
for pin in BUTTONS:
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Configuration du buzzer en sortie
GPIO.setup(BUZZER_PIN, GPIO.OUT)
GPIO.output(BUZZER_PIN, GPIO.LOW)


# Active le buzzer pendant une durée donnée
def buzzer_beep(duration=0.1):
    GPIO.output(BUZZER_PIN, GPIO.HIGH)
    time.sleep(duration)
    GPIO.output(BUZZER_PIN, GPIO.LOW)

# Son court lors d’un rebond de balle
def buzzer_bounce():
    buzzer_beep(0.05)

# Son distinct lors d’un but
def buzzer_goal():
    buzzer_beep(0.1)
    time.sleep(0.05)
    buzzer_beep(0.1)


# Gère les messages reçus depuis le client WebSocket
async def handle_client_message(msg: str):
    if msg == "sound_bounce":
        threading.Thread(target=buzzer_bounce, daemon=True).start()
    elif msg == "sound_goal":
        threading.Thread(target=buzzer_goal, daemon=True).start()


# Envoie un message à tous les clients connectés
async def broadcast_message(msg: str):
    dead = []

    for ws in websockets:
        try:
            await ws.send_text(msg)
        except:
            dead.append(ws)

    for ws in dead:
        websockets.discard(ws)


# Thread qui surveille l’état des boutons GPIO
def button_watcher(loop):
    last_state = {pin: 1 for pin in BUTTONS}

    while True:
        for pin, name in BUTTONS.items():
            state = GPIO.input(pin)

            if state == 0 and last_state[pin] == 1:
                asyncio.run_coroutine_threadsafe(
                    broadcast_message(f"{name}_pressed"),
                    loop
                )

            elif state == 1 and last_state[pin] == 0:
                asyncio.run_coroutine_threadsafe(
                    broadcast_message(f"{name}_released"),
                    loop
                )

            last_state[pin] = state

        time.sleep(0.03)


# Démarrage du thread GPIO au lancement du serveur
@app.on_event("startup")
async def startup_event():
    loop = asyncio.get_running_loop()
    threading.Thread(
        target=button_watcher,
        args=(loop,),
        daemon=True
    ).start()


# Lancement du serveur FastAPI
if __name__ == "__main__":
    print(">>> Lancement du serveur FastAPI avec base de données SQLite...")
    uvicorn.run(
        "serveur:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )
