import os
import tempfile
from pathlib import Path

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

from ml.base import FramePreprocessor

MODEL_PATH = Path(__file__).resolve().parent / "models" / "face_landmarker.task"


class MouthCropper(FramePreprocessor):
    LIP_IDS = [61, 291, 0, 17, 37, 267, 84, 314, 78, 308]

    def __init__(self, n_frames=75, size=(128, 64), margin=0.75,
                grayscale: bool = True,y_shift: float = 0.0):
        self._grayscale = grayscale
        self._y_shift=y_shift
        self._n_frames = n_frames
        self._size = size
        self._margin = margin
        options = vision.FaceLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=str(MODEL_PATH)),
            running_mode=vision.RunningMode.IMAGE,
            num_faces=1,
        )
        self._landmarker = vision.FaceLandmarker.create_from_options(options)

    # ---- public API -------------------------------------------------
    def process(self, video_bytes: bytes) -> np.ndarray:
        path = self._write_temp(video_bytes)
        try:
            frames = self._read_and_crop(path)
        finally:
            os.remove(path)
        return self._fix_length(frames)

    # ---- private helpers --------------------------------------------
    @staticmethod
    def _write_temp(video_bytes: bytes) -> str:
        # OpenCV reads from a file path, so bytes go to a temp file first
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mpg") as f:
            f.write(video_bytes)
            return f.name

    def _read_and_crop(self, path: str) -> list[np.ndarray]:
        cap = cv2.VideoCapture(path)
        frames, boxes = [], []
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frames.append(frame)
            boxes.append(self._mouth_box(frame))
        cap.release()

        found = sum(b is not None for b in boxes)
        # print(f"[CROP] read {len(frames)} frames, face found in {found}")

        boxes = self._smooth(boxes)
        crops = []
        for frame, box in zip(frames, boxes):
            if box is None:          # only if NO face anywhere in the clip
                continue
            crops.append(self._crop_box(frame, box))
        return crops

    def _mouth_box(self, frame: np.ndarray):
        """Return (center_x, center_y, mouth_width) or None."""
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = self._landmarker.detect(mp_image)
        if not result.face_landmarks:
            return None
        lm = result.face_landmarks[0]
        xs = [lm[i].x * w for i in self.LIP_IDS]
        ys = [lm[i].y * h for i in self.LIP_IDS]
        return ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2,
                max(xs) - min(xs))

    @staticmethod
    def _smooth(boxes, window: int = 9):
        """Fill missed frames by interpolation, then moving-average."""
        idx = [i for i, b in enumerate(boxes) if b is not None]
        if not idx:
            return boxes
        arr = np.array([boxes[i] for i in idx])                  # (k, 3)
        full = np.stack([np.interp(range(len(boxes)), idx, arr[:, j])
                         for j in range(3)], axis=1)             # (n, 3)
        pad = window // 2
        padded = np.pad(full, ((pad, pad), (0, 0)), mode="edge")
        kernel = np.ones(window) / window
        smooth = np.stack([np.convolve(padded[:, j], kernel, mode="valid")
                           for j in range(3)], axis=1)
        return [tuple(r) for r in smooth]

    def _crop_box(self, frame: np.ndarray, box) -> np.ndarray:
        h, w, _ = frame.shape
        cx, cy, mouth_w = box
        box_w = mouth_w * (1 + 2 * self._margin)
        box_h = box_w * self._size[1] / self._size[0]
        cy = cy + self._y_shift * box_h   
        x1, x2 = int(max(cx - box_w / 2, 0)), int(min(cx + box_w / 2, w))
        y1, y2 = int(max(cy - box_h / 2, 0)), int(min(cy + box_h / 2, h))
        crop = frame[y1:y2, x1:x2]
        if self._grayscale:
            crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        return cv2.resize(crop, self._size, interpolation=cv2.INTER_LANCZOS4)

    def _fix_length(self, crops: list[np.ndarray]) -> np.ndarray:
        """Pad or trim to exactly n_frames so the model gets a fixed shape."""
        if not crops:
            raise ValueError("No face detected in the video")
        if len(crops) >= self._n_frames:
            crops = crops[: self._n_frames]
        else:
            crops = crops + [crops[-1]] * (self._n_frames - len(crops))
        return np.stack(crops)   # (n_frames, height, width)
    
    def close(self):
        self._landmarker.close()