from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from core.container import container

router = APIRouter(prefix="/speech", tags=["speech"])


class SpeakRequest(BaseModel):
    text: str


@router.post("/speak")
def speak(req: SpeakRequest):
    try:
        audio = container.speech.synthesize(req.text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return Response(content=audio, media_type=container.speech.media_type)