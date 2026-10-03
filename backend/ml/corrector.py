from ml.base import TextCorrector

class DummyCorrector(TextCorrector):
    def correct(self, text: str) -> str:
        return f"I need {text.split()[-1]}, please."

class PassthroughCorrector(TextCorrector):
    def correct(self, text: str) -> str:
        return text