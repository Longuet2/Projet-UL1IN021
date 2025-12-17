import asyncio
import threading
import time
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from pydantic import BaseModel
import uvicorn
from database import PongDatabase

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialiser la base de données
db = PongDatabase()

# Modèle pour recevoir les scores
class GameScore(BaseModel):
    player1_name: str
    player2_name: str
    player1_score: int
    player2_score: int

@app.get("/", response_class=HTMLResponse)
def acceuil(request: Request):
    return templates.TemplateResponse("acceuil.html", {"request": request})

@app.get("/jeu", response_class=HTMLResponse)
def pong(request: Request):
    return templates.TemplateResponse("jeu_pong.html", {"request": request})

@app.get("/historique", response_class=HTMLResponse)
def historique(request: Request):
    return templates.TemplateResponse("historique.html", {"request": request})

# API pour récupérer l'historique des parties
@app.get("/api/games")
def get_games():
    games = db.get_all_games()
    return JSONResponse(content=games)

# API pour ajouter une partie
@app.post("/api/games")
def add_game(game: GameScore):
    try:
        game_id = db.add_game(
            player1_name=game.player1_name,
            player2_name=game.player2_name,
            player1_score=game.player1_score,
            player2_score=game.player2_score
        )
        return JSONResponse(content={'success': True, 'game_id': game_id})
    except Exception as e:
        return JSONResponse(content={'success': False, 'error': str(e)}, status_code=400)

# WebSocket (ton code existant, commenté)
#websockets = set()

#@app.websocket("/ws")
#async def websocket_endpoint(ws: WebSocket):
    #await ws.accept()
    #websockets.add(ws)
    #try:
        #while True:
            #msg = await ws.receive_text()
            #await handle_client_message(msg)
    #except:
        #pass
    #finally:
        #if ws in websockets:
            #websockets.remove(ws)

if __name__ == "__main__":
    print(">>> Lancement du serveur FastAPI avec base de données SQLite...")
    uvicorn.run("serveur:app", host="0.0.0.0", port=8000, reload=False)
