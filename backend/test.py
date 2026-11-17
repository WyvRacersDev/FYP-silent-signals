# from core.container import container

# with open("test/bwim4n.mpg", "rb") as f:
#     pred = container.lipread.run(f.read())

# print(pred.raw_text)
# for w in pred.words:
#     print(f"{w.text:10s} {w.confidence:.0%}")

# container.preprocessor.close()

# import glob, os
# from core.container import container

# CMD = dict(b="bin", l="lay", p="place", s="set")
# COL = dict(b="blue", g="green", r="red", w="white")
# PRE = dict(a="at", b="by", i="in", w="with")
# ADV = dict(a="again", n="now", p="please", s="soon")
# DIG = dict(z="zero", **{str(i): w for i, w in enumerate(
#     "one two three four five six seven eight nine".split(), start=1)})

# def truth(code: str) -> list[str]:
#     return [CMD[code[0]], COL[code[1]], PRE[code[2]], code[3], DIG[code[4]], ADV[code[5]]]

# correct = total = 0
# for path in sorted(glob.glob("test/*.mpg")):
#     code = os.path.splitext(os.path.basename(path))[0]
#     try:
#         with open(path, "rb") as f:
#             pred = container.lipread.run(f.read()).raw_text.split()
#     except ValueError as e:
#         print(code, "FAILED:", e); continue
#     exp = truth(code)
#     hits = sum(a == b for a, b in zip(pred, exp))
#     correct += hits; total += len(exp)
#     print(f"{code}: {hits}/6  pred='{' '.join(pred)}'  true='{' '.join(exp)}'")

# print(f"\nword accuracy: {correct}/{total} = {correct/total:.0%}")

import glob, os
import cv2, numpy as np
from ml.preprocessing import MouthCropper
from ml.lip_model import PretrainedLipNet
from core.container import WEIGHTS

CMD = dict(b="bin", l="lay", p="place", s="set")
COL = dict(b="blue", g="green", r="red", w="white")
PRE = dict(a="at", b="by", i="in", w="with")
ADV = dict(a="again", n="now", p="please", s="soon")
DIG = dict(z="zero", **{str(i): w for i, w in enumerate(
    "one two three four five six seven eight nine".split(), start=1)})

def truth(c):
    return [CMD[c[0]], COL[c[1]], PRE[c[2]], c[3], DIG[c[4]], ADV[c[5]]]

model = PretrainedLipNet(str(WEIGHTS))
paths = sorted(glob.glob("test/*.mpg"))
for margin in (0.6, 0.75, 0.9):
  for y_shift in (-0.1, 0.0, 0.1):
    cropper = MouthCropper(grayscale=False, margin=margin, y_shift=y_shift)
    hits = total = 0
    sample = None
    for p in paths:
        code = os.path.splitext(os.path.basename(p))[0]
        with open(p, "rb") as f:
            frames = cropper.process(f.read())
        if sample is None:
            sample = frames[37]
        pred = [w.text for w in model.predict(frames)]
        hits += sum(a == b for a, b in zip(pred, truth(code)))
        total += 6
    cv2.imwrite(f"margin_{margin}.png", sample)
    print(f"margin={margin} y_shift={y_shift}: {hits}/{total} = {hits/total:.0%}", flush=True)
    cropper.close()

# container.preprocessor.close()
