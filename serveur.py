import asyncio
import threading
import time
import RPi.GPIO as GPIO
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
import uvicorn

# -------------------------------
# FastAPI
# -------------------------------
app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

websockets = set()

@app.get("/", response_class=HTMLResponse)
def acceuil(request: Request):
    return templates.TemplateResponse("acceuil.html", {"request": request})

@app.get("/jeu", response_class=HTMLResponse)
def pong(request: Request):
    return templates.TemplateResponse("jeu_pong.html", {"request": request})

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    websockets.add(ws)
    try:
        while True:
            await asyncio.sleep(1)
    except:
        pass
    finally:
        websockets.remove(ws)

# -------------------------------
# GPIO
# -------------------------------

BUTTONS = {
    5:  "BTN_1",  # pad gauche monte
    16: "BTN_2",  # pad gauche descend
    24: "BTN_3",  # pad droite monte
    22: "BTN_4"   # pad droite descend
}

GPIO.setmode(GPIO.BCM)
for pin in BUTTONS:
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# -------------------------------
# Broadcast WebSocket
# -------------------------------

async def broadcast_message(msg: str):
    dead = []
    for ws in websockets:
        try:
            await ws.send_text(msg)
        except:
            dead.append(ws)
    for ws in dead:
        websockets.remove(ws)

# -------------------------------
# Thread de surveillance GPIO
# -------------------------------

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

# -------------------------------
# D�marrage du watcher au startup
# -------------------------------

@app.on_event("startup")
async def startup_event():
    loop = asyncio.get_running_loop()
    thread = threading.Thread(target=button_watcher, args=(loop,), daemon=True)
    thread.start()

# -------------------------------
# Lancement serveur
# -------------------------------

if __name__ == "__main__":
    print(">>> Lancement du serveur FastAPI...")
    uvicorn.run("serveur:app", host="0.0.0.0", port=8000, reload=False)
