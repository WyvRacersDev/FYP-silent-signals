from ml.base import TTSEngine
from notifiers.base import Notifier
from repositories.base import UserRepository

class EmergencyService:
    PHRASES = ["I need help", "Call my family", "I am feeling sick"]

    def __init__(self, tts: TTSEngine, notifier: Notifier, users: UserRepository):
        self._tts = tts
        self._notifier = notifier
        self._users = users

    def get_phrases(self) -> list[str]:
        return self.PHRASES

    def trigger(self, user_id: int, phrase: str) -> dict:
        user = self._users.get(user_id)
        if user is None:
            raise ValueError("User not found")
        self._tts.speak(phrase)
        sent = self._notifier.send(user.guardian_contact,
                                   f"{user.name} says: {phrase}")
        return {"spoken": True, "guardian_notified": sent}