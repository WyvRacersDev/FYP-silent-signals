import numpy as np
import torch
from ml.base import LipReadingModel
from domain.prediction import Word

class DummyLipModel(LipReadingModel):
    def predict(self, frames: np.ndarray) -> list[Word]:
        print(f"[MODEL] received frames with shape {frames.shape}")
        return [Word(text="help", confidence=0.92),
                Word(text="water", confidence=0.64)]


class PretrainedLipNet(LipReadingModel):
    LETTERS = " abcdefghijklmnopqrstuvwxyz"   # CTC blank = index 0

    def __init__(self, weights_path: str, device: str = "cpu"):
        from ml.vendor.lipnet_model import LipNet
        self._device = torch.device(device)
        self._net = LipNet().to(self._device)
        state = torch.load(weights_path, map_location=self._device)
        # weights saved from DataParallel have a "module." prefix
        state = {k.replace("module.", "", 1): v for k, v in state.items()}
        self._net.load_state_dict(state)
        self._net.eval()

    def predict(self, frames: np.ndarray) -> list[Word]:
        x = torch.from_numpy(frames).float() / 255.0        # (T,H,W[,3])
        if x.ndim == 3:                                      # grayscale -> 3ch
            x = x.unsqueeze(-1).repeat(1, 1, 1, 3)
        x = x.permute(3, 0, 1, 2).unsqueeze(0)               # (1,3,T,H,W)

        with torch.no_grad():
            logits = self._net(x.to(self._device))
        # batch is 1, so this works whether output is (T,1,28) or (1,T,28)
        probs = torch.softmax(logits.reshape(-1, 28), dim=-1).cpu().numpy()
        return self._decode(probs)

    def _decode(self, probs: np.ndarray) -> list[Word]:
        """Greedy CTC decode; word confidence = mean prob of its letters."""
        best = probs.argmax(axis=1)
        chars, prev = [], 0
        for t, idx in enumerate(best):
            if idx != 0 and idx != prev:                     # skip blank + repeats
                chars.append((self.LETTERS[idx - 1], float(probs[t, idx])))
            prev = idx

        words, current = [], []
        for ch, p in chars:
            if ch == " ":
                if current:
                    words.append(self._make_word(current))
                    current = []
            else:
                current.append((ch, p))
        if current:
            words.append(self._make_word(current))
        return words

    @staticmethod
    def _make_word(letters: list[tuple[str, float]]) -> Word:
        text = "".join(c for c, _ in letters)
        conf = sum(p for _, p in letters) / len(letters)
        return Word(text=text, confidence=round(conf, 3))