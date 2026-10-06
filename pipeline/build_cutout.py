"""Andrés cut out of his own camera (VP9 alpha WebM), frame-for-frame with andres_hi.mp4 (source 140 s + t).
Lets type sit on the wall BEHIND him: base video -> type -> this cutout on top, same transform."""
import os, subprocess, numpy as np
from paths import PUBLIC
from PIL import Image, ImageFilter
from rembg import remove, new_session
SRC = os.path.join(PUBLIC, "andres_hi.mp4")  # made by make_proxies.sh
OUT = os.path.join(PUBLIC, "andres_cut.webm")
W, H = 1080, 1920
MW, MH = 540, 960
fps = "24000/1001"
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-vf", f"scale={W}:{H}:flags=lanczos", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, bufsize=W * H * 3 * 4)
enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", fps, "-i", "-",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "8M", "-deadline", "realtime", "-cpu-used", "6",
                        "-row-mt", "1", "-auto-alt-ref", "0", OUT], stdin=subprocess.PIPE)
sess = new_session("u2net_human_seg")
n = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    img = Image.frombytes("RGB", (W, H), buf)
    m = remove(img.resize((MW, MH), Image.BILINEAR), session=sess, only_mask=True, post_process_mask=True)
    m = m.resize((W, H), Image.BILINEAR).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = np.dstack([np.asarray(img), np.asarray(m)])
    enc.stdin.write(rgba.astype(np.uint8).tobytes())
    n += 1
    if n % 120 == 0:
        print(n, flush=True)
enc.stdin.close(); enc.wait(); dec.wait()
print("cutout done", n)
