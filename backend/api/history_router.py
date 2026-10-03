from fastapi import APIRouter
from core.container import container
from domain.conversation import Conversation

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/{user_id}", response_model=list[Conversation])
def get_history(user_id: int):
    return container.history.list(user_id)