from ml.base import EmotionDetector

class DummyEmotion(EmotionDetector):
    def detect(self, video_bytes: bytes) -> str:
        return "neutral"