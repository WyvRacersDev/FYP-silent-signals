from ml.base import (LipReadingModel, TextCorrector,
                     EmotionDetector, FramePreprocessor)
from services.history_service import HistoryService
from domain.prediction import Prediction

class LipReadService:
    def __init__(self, preprocessor: FramePreprocessor,
                 model: LipReadingModel,
                 corrector: TextCorrector,
                 emotion: EmotionDetector,
                 history: HistoryService):
        self._preprocessor = preprocessor
        self._model = model
        self._corrector = corrector
        self._emotion = emotion
        self._history = history

    def run(self, video_bytes: bytes, user_id: int = 1) -> Prediction:
        frames = self._preprocessor.process(video_bytes)   # NEW step
        words = self._model.predict(frames)
        raw = " ".join(w.text for w in words)
        prediction = Prediction(
            words=words,
            raw_text=raw,
            corrected_text=self._corrector.correct(raw),
            emotion=self._emotion.detect(video_bytes),
        )
        self._history.save(user_id, prediction)
        return prediction