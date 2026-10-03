from abc import ABC, abstractmethod
from domain.conversation import Conversation
from domain.user import User

class ConversationRepository(ABC):
    @abstractmethod
    def add(self, conversation: Conversation) -> Conversation: ...
    @abstractmethod
    def list_for_user(self, user_id: int) -> list[Conversation]: ...

class UserRepository(ABC):
    @abstractmethod
    def get(self, user_id: int) -> User | None: ...