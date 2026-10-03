from fastapi import APIRouter, UploadFile, File, HTTPException
from core.container import container
from domain.prediction import Prediction

router = APIRouter(prefix="/lipread", tags=["lipread"])

@router.post("/video", response_model=Prediction)
async def lipread_video(file: UploadFile = File(...), user_id: int = 1):
    data = await file.read()
    try:
        return container.lipread.run(data, user_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))