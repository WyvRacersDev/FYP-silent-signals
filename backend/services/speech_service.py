from ml.base import TTSEngine


class SpeechService:
    MAX_CHARS = 500

    def __init__(self, tts: TTSEngine):
        self._tts = tts

    @property
    def media_type(self) -> str:
        return self._tts.media_type

    def synthesize(self, text: str) -> bytes:
        text = text.strip()
        if not text:
            raise ValueError("Text is empty")
        if len(text) > self.MAX_CHARS:
            raise ValueError(f"Text too long (max {self.MAX_CHARS} characters)")
        return self._tts.synthesize(text)