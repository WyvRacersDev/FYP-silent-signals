from abc import ABC, abstractmethod
from domain.prediction import Word
import numpy as np

class LipReadingModel(ABC):
    @abstractmethod
    def predict(self, frames: np.ndarray) -> list[Word]:
        """frames: (n_frames, height, width) grayscale."""
        
class TextCorrector(ABC):
    @abstractmethod
    def correct(self, text: str) -> str: ...

class TTSEngine(ABC):
    media_type: str = "audio/wav"

    @abstractmethod
    def synthesize(self, text: str) -> bytes:
        """Return encoded audio bytes for the text."""
        ...

    @abstractmethod
    def speak(self, text: str) -> None:
        """Play audio on the machine running the server."""
        ...

class EmotionDetector(ABC):
    @abstractmethod
    def detect(self, video_bytes: bytes) -> str: ...

class FramePreprocessor(ABC):
    @abstractmethod
    def process(self, video_bytes: bytes) -> np.ndarray:
        """Return array of shape (n_frames, height, width), grayscale."""
        ...