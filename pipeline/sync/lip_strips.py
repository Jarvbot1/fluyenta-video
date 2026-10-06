"""Lip-closure sync check: the deciding test that the two cameras are in sync.

For a word starting with a bilabial ("Bueno", "pues") after silence, find the audio onset in the interview audio, then tile the
4K mouth crops from Andrés' camera around that moment with their timestamps. The lips should part within one frame of the
audio onset (Spanish /b/ is voiced, so the sound can start a frame before the lips open).

Usage: python3 pipeline/sync/lip_strips.py 6.0 7.0 [88.3 89.3 ...]   (pairs of search-window seconds)
Writes pipeline/work/lip_<onset>.jpg; open them and read the frame where the lips part.
"""
import glob, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from paths import ANDRES_RAW, JUAN_RAW, WORK

SR = 48000
FPS = 24000 / 1001


def audio():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", JUAN_RAW, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def onset(x, t0, t1):
    seg = x[int(t0 * SR):int(t1 * SR)]
    win, hop = int(0.004 * SR), int(0.001 * SR)
    db = 20 * np.log10(np.array([np.sqrt(np.mean(seg[i:i + win] ** 2) + 1e-12) for i in range(0, len(seg) - win, hop)]))
    floor = np.percentile(db[: max(20, int(len(db) * 0.3))], 50)
    return t0 + int(np.argmax(db > floor + 15)) * 0.001


def mouth_box(t):
    """Andrés' face box at time t (Haar on a 540x960 frame), scaled to the 4K source."""
    import cv2
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", ANDRES_RAW, "-frames:v", "1", "-vf", "scale=540:960",
                        "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True).stdout
    f = np.frombuffer(r, np.uint8).reshape(960, 540)
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    x, y, w, h = max(casc.detectMultiScale(f, 1.1, 5, minSize=(60, 60)), key=lambda b: b[2] * b[3])
    return [v * 4 for v in (x, y, w, h)]


def strip(t0):
    fi = int(round(t0 * FPS))
    x, y, w, h = mouth_box(t0)
    S = int(w * 0.9)
    cx0, cy0 = int(x + w * 0.5 - S / 2), int(y + h * 0.85 - S * 0.45)
    start = (fi - 8) / FPS - 0.002
    tmp = os.path.join(WORK, "lipframes")
    os.makedirs(tmp, exist_ok=True)
    for f in glob.glob(os.path.join(tmp, "f_*.png")):
        os.remove(f)
    r = subprocess.run(["ffmpeg", "-v", "info", "-y", "-ss", f"{start:.4f}", "-i", ANDRES_RAW, "-frames:v", "14",
                        "-vf", f"crop={S}:{int(S * 0.7)}:{cx0}:{cy0},scale=300:-1,showinfo", os.path.join(tmp, "f_%02d.png")],
                       capture_output=True, text=True)
    pts = [float(m) for m in re.findall(r"pts_time:([\d.]+)", r.stderr)]
    ims = [Image.open(f) for f in sorted(glob.glob(os.path.join(tmp, "f_*.png")))]
    W, H = ims[0].size
    sheet = Image.new("RGB", (W * 7, H * 2))
    for i, im in enumerate(ims):
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 170, 26], fill="black")
        d.text((5, 5), f"{start + pts[i]:.3f}s", fill="yellow")
        sheet.paste(im, ((i % 7) * W, (i // 7) * H))
    out = os.path.join(WORK, f"lip_{t0:.3f}.jpg")
    sheet.save(out)
    return out


if __name__ == "__main__":
    vals = [float(v) for v in sys.argv[1:]] or [6.0, 7.0, 88.3, 89.3]
    x = audio()
    for a, b in zip(vals[::2], vals[1::2]):
        t = onset(x, a, b)
        print(f"audio onset {t:.3f}s -> {strip(t)}")
