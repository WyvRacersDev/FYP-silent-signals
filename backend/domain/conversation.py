from datetime import datetime
from pydantic import BaseModel, Field

class Conversation(BaseModel):
    id: int | None = None
    user_id: int
    created_at: datetime = Field(default_factory=datetime.now)
    raw_text: str
    corrected_text: str
    emotion: str = "neutral"