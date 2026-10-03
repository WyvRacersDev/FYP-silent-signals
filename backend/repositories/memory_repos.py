from repositories.base import ConversationRepository, UserRepository
from domain.conversation import Conversation
from domain.user import User

class InMemoryConversationRepository(ConversationRepository):
    def __init__(self):
        self._items: list[Conversation] = []

    def add(self, conversation: Conversation) -> Conversation:
        conversation.id = len(self._items) + 1
        self._items.append(conversation)
        return conversation

    def list_for_user(self, user_id: int) -> list[Conversation]:
        return [c for c in self._items if c.user_id == user_id]

class InMemoryUserRepository(UserRepository):
    def __init__(self):
        # one seeded demo user so we can test without auth
        self._users = {
            1: User(id=1, name="Demo User", email="demo@test.com",
                    guardian_name="Guardian", guardian_contact="guardian@test.com")
        }

    def get(self, user_id: int) -> User | None:
        return self._users.get(user_id)