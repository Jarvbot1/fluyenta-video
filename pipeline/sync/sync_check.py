import numpy as np, json, os, sys, wave
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from paths import WORK, DATA
from scipy.ndimage import uniform_filter1d
fps = 24000/1001
w = wave.open(os.path.join(WORK, "interview_16k.wav"))  # written by transcribe.py; sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)/32768
# band-limit to the voice: crude high-pass via differencing to drop rumble
a = np.diff(a, prepend=0)
n = int(len(a)/sr*fps)
hop = sr/fps
env = np.array([np.sqrt(np.mean(a[int(i*hop):int((i+1)*hop)]**2)+1e-12) for i in range(n)])
env = np.log(env)
T = json.load(open(os.path.join(DATA, "transcript.json")))
juan_spans = [(0,5.8),(25.8,29.5),(48.2,49.8),(72.3,79.4),(82.3,84.0),(84.5,88.0),(140.6,149.1),(150.4,155.85),(213.5,218.4),(272.1,276)]
def mask_for(who):
    t = np.arange(n)/fps
    mj = np.zeros(n,bool)
    for s,e in juan_spans: mj |= (t>=s)&(t<e)
    speech = np.zeros(n,bool)
    for s in T: speech |= (t>=s["start"])&(t<s["end"])
    return (mj if who=="juan" else speech & ~mj)
def z(x):
    x = uniform_filter1d(x.astype(np.float64), 3)
    return (x-x.mean())/(x.std()+1e-9)
for who in ["andres","juan"]:
    m = np.load(os.path.join(WORK, f"mouth_{who}.npy"))[:n]
    mk = mask_for(who)[:len(m)]
    e = env[:len(m)]
    res = []
    for lag in range(-36, 37):   # lag>0: video moves AFTER audio (video late)
        if lag >= 0: mm, ee, kk = m[lag:], e[:len(e)-lag], mk[:len(mk)-lag]
        else: mm, ee, kk = m[:lag], e[-lag:], mk[-lag:]
        mm, ee = mm[kk], ee[kk]
        res.append((lag, np.corrcoef(z(mm), z(ee))[0,1]))
    res.sort(key=lambda r: -r[1])
    print(who, "frames used", mk.sum(), "best lags (frames @23.976, corr):", [(l, round(c,3)) for l,c in res[:5]])
    zero = [c for l,c in res if l==0][0]
    print("   corr at lag 0:", round(zero,3), " -> best lag ms:", round(res[0][0]/fps*1000))
