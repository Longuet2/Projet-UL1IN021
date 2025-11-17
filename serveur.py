import uvicorn
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from gpiozero import Button

app = FastAPI()
site = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def acceuil(request:Request):
    return site.TemplateResponse("acceuil.html",{'request':request})


@app.get("/jeu")
def pong(request:Request):
    return site.TemplateResponse("jeu_pong.html",{'request': request})

if __name__ == "__main__":
    uvicorn.run(app)
