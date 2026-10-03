from repositories.base import ConversationRepository, UserRepository
from repositories.orm_models import UserORM, ConversationORM
from core.database import SessionLocal
from domain.conversation import Conversation
from domain.user import User

class SqliteConversationRepository(ConversationRepository):
    def add(self, conversation: Conversation) -> Conversation:
        with SessionLocal() as session:
            row = ConversationORM(
                user_id=conversation.user_id,
                created_at=conversation.created_at,
                raw_text=conversation.raw_text,
                corrected_text=conversation.corrected_text,
                emotion=conversation.emotion,
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._to_domain(row)

    def list_for_user(self, user_id: int) -> list[Conversation]:
        with SessionLocal() as session:
            rows = (session.query(ConversationORM)
                    .filter(ConversationORM.user_id == user_id)
                    .order_by(ConversationORM.created_at.desc())
                    .all())
            return [self._to_domain(r) for r in rows]

    @staticmethod
    def _to_domain(row: ConversationORM) -> Conversation:
        return Conversation(id=row.id, user_id=row.user_id,
                            created_at=row.created_at,
                            raw_text=row.raw_text,
                            corrected_text=row.corrected_text,
                            emotion=row.emotion)

class SqliteUserRepository(UserRepository):
    def get(self, user_id: int) -> User | None:
        with SessionLocal() as session:
            row = session.get(UserORM, user_id)
            return self._to_domain(row) if row else None

    def add(self, user: User) -> User:
        with SessionLocal() as session:
            row = UserORM(**user.model_dump(exclude={"id"}))
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._to_domain(row)

    def count(self) -> int:
        with SessionLocal() as session:
            return session.query(UserORM).count()

    @staticmethod
    def _to_domain(row: UserORM) -> User:
        return User(id=row.id, name=row.name, email=row.email,
                    guardian_name=row.guardian_name,
                    guardian_contact=row.guardian_contact,
                    font_size=row.font_size, dark_mode=row.dark_mode,
                    high_contrast=row.high_contrast)