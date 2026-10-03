from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.lipread_router import router as lipread_router
from api.emergency_router import router as emergency_router
from api.history_router import router as history_router

from api.speech_router import router as speech_router

app = FastAPI(title="Silent Signals API")
app.include_router(speech_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lipread_router)
app.include_router(emergency_router)
app.include_router(history_router)

@app.get("/health")
def health():
    return {"status": "ok"}