from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.container import container

router = APIRouter(prefix="/emergency", tags=["emergency"])

class TriggerRequest(BaseModel):
    user_id: int = 1
    phrase: str

@router.get("/phrases")
def phrases():
    return container.emergency.get_phrases()

@router.post("/trigger")
def trigger(req: TriggerRequest):
    try:
        return container.emergency.trigger(req.user_id, req.phrase)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))