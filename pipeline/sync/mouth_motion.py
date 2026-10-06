# Mouth-motion signal per video frame, for lip-sync verification.
# Usage: python3 mouth_motion.py <video> <out.npy>
import sys, subprocess, numpy as np, cv2
src, out = sys.argv[1], sys.argv[2]
W, H = 540, 960
cmd = ["ffmpeg","-v","error","-hwaccel","videotoolbox","-i",src,"-vf",f"scale={W}:{H}","-pix_fmt","gray","-f","rawvideo","-"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, bufsize=W*H*8)
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
box = None; prev = None; sig = []; boxes = []; i = 0
while True:
    buf = p.stdout.read(W*H)
    if len(buf) < W*H: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W)
    if i % 6 == 0 or box is None:
        faces = casc.detectMultiScale(f, 1.1, 5, minSize=(60,60))
        if len(faces):
            fb = max(faces, key=lambda r: r[2]*r[3])
            box = fb if box is None else (0.6*np.array(box) + 0.4*np.array(fb))
    if box is not None:
        x,y,w,h = [int(v) for v in box]
        m = f[y+int(h*0.62):y+int(h*1.02), x+int(w*0.22):x+int(w*0.78)].astype(np.float32)
        # head-motion reference: the upper face (eyes/forehead) in the same frame
        u = f[y+int(h*0.15):y+int(h*0.45), x+int(w*0.22):x+int(w*0.78)].astype(np.float32)
        if prev is not None and prev[0].shape == m.shape and prev[1].shape == u.shape:
            dm = np.abs(m - prev[0]).mean(); du = np.abs(u - prev[1]).mean()
            sig.append(max(dm - 0.8*du, 0))
        else:
            sig.append(0.0)
        prev = (m, u)
        boxes.append([x,y,w,h])
    else:
        sig.append(0.0); boxes.append([0,0,0,0])
    i += 1
np.save(out, np.array(sig, np.float32))
np.save(out.replace('.npy','_boxes.npy'), np.array(boxes))
print("frames", i)
