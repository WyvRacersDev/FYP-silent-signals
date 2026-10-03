from repositories.base import ConversationRepository
from domain.conversation import Conversation
from domain.prediction import Prediction

class HistoryService:
    def __init__(self, repo: ConversationRepository):
        self._repo = repo

    def save(self, user_id: int, prediction: Prediction) -> Conversation:
        return self._repo.add(Conversation(
            user_id=user_id,
            raw_text=prediction.raw_text,
            corrected_text=prediction.corrected_text,
            emotion=prediction.emotion,
        ))

    def list(self, user_id: int) -> list[Conversation]:
        return self._repo.list_for_user(user_id)