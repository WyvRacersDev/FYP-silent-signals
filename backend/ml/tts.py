from ml.base import TTSEngine

class ConsoleTTS(TTSEngine):
    def speak(self, text: str) -> None:
        print(f"[TTS] {text}")