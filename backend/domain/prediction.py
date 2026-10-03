from pydantic import BaseModel

class Word(BaseModel):
    text: str
    confidence: float

class Prediction(BaseModel):
    words: list[Word]
    raw_text: str
    corrected_text: str
    emotion: str = "neutral"