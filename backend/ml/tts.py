import io
import os
import tempfile
import threading

from ml.base import TTSEngine


class ConsoleTTS(TTSEngine):
    def synthesize(self, text: str) -> bytes:
        raise RuntimeError("ConsoleTTS cannot produce audio")

    def speak(self, text: str) -> None:
        print(f"[TTS] {text}")


class Pyttsx3Engine(TTSEngine):
    """Offline voice. Returns WAV on Windows/Linux (AIFF on macOS)."""
    media_type = "audio/wav"

    def __init__(self, rate: int = 160):
        self._rate = rate
        self._lock = threading.Lock()   # pyttsx3 is not thread-safe

    def _new_engine(self):
        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty("rate", self._rate)
        return engine

    def synthesize(self, text: str) -> bytes:
        fd, path = tempfile.mkstemp(suffix=".wav")
        os.close(fd)
        try:
            with self._lock:
                engine = self._new_engine()
                engine.save_to_file(text, path)
                engine.runAndWait()
                engine.stop()
            with open(path, "rb") as f:
                data = f.read()
        finally:
            os.remove(path)
        if not data:
            raise RuntimeError("TTS produced no audio (is espeak-ng installed?)")
        return data

    def speak(self, text: str) -> None:
        try:
            with self._lock:
                engine = self._new_engine()
                engine.say(text)
                engine.runAndWait()
                engine.stop()
        except Exception as e:   # no audio device, e.g. WSL
            print(f"[TTS] could not play on server: {e}")


class GTTSEngine(TTSEngine):
    """Better voice, needs internet. Returns MP3."""
    media_type = "audio/mpeg"

    def synthesize(self, text: str) -> bytes:
        from gtts import gTTS
        buf = io.BytesIO()
        gTTS(text=text, lang="en").write_to_fp(buf)
        return buf.getvalue()

    def speak(self, text: str) -> None:
        print("[gTTS] server-side playback not supported; use synthesize()")