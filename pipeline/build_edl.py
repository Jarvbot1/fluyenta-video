"""Clip 03 ("¿Cómo ha impactado a los clientes?") edit list -> master voice track + Remotion data.

Every cut sits in measured silence (energy profiles in this session). Picture and sound come from
the same timeline export; three lip checks (6.7s, 89.1s, 155.8s) put sync within one frame, and the
audio is laid 30 ms behind the picture as a safety margin (late audio reads fine, early does not).

Outputs:
  pipeline/work/master.wav                  48 kHz stereo, -14 LUFS
  public/fluyenta-interview/master.wav      copy for Remotion
  src/fluyenta-interview/edl.ts             spans + captions (generated, committed)
"""
import json, subprocess, re, os
import numpy as np

from paths import JUAN_RAW, WORK, DATA, PUBLIC, EDL_TS
HERE = WORK
SR = 48000
AUDIO_LAG = 0.030          # audio plays this much behind the picture
TAIL = 3.8                 # end card after the last word
FADE = 0.008
COMP = "acompressor=threshold=0.06:ratio=2.5:attack=6:release=140:makeup=1.5"

# (camera, src_in, src_out). The camera here is the shot under the START of the span; the comp
# decides later shots (reaction cutaways, slides) from the beat list.
SPANS = [
    ("open", 142.86, 153.95),   # span starts below sit past any trimmed tail, allowing for the 30 ms audio lag. Juan: "solo que la IA afecte..." / Andrés: "Correcto, sí." / Juan: "Ok, y ¿cómo ha impactado esto a los clientes que ha tenido?" + a natural 0.45 s before Andrés answers
    ("andres", 155.72, 168.40), # "Bueno, principalmente el consumo de tokens ... se consumiría. ... Eh, la IA se utiliza no para,"
    ("andres", 169.92, 176.80), # "ejecutar acciones, sino para orquestar y para modelar procesos de negocio." + breath   (cut: one "eh")
    ("andres", 179.98, 213.36), # "para integrar, por ejemplo, se pueden integrar periféricos ... esos datos."           (cut: "Eh, y, eh,")
]

# Andrés speaks inside the opening span only here (src seconds)
ANDRES_IN_OPEN = (149.15, 150.10)
DROP = {"eh", "eh,", "eh.", "Eh,", "Eh", "Eh."}
FIX = {"%": "%"}

LINES = [
    ("juan", "solo que la [IA] afecte"), ("juan", "lo que tiene que afectar,"), ("juan", "tocar lo que tiene que tocar"),
    ("juan", "con un motivo específico."), ("andres", "Correcto, sí."), ("juan", "Ok, y ¿cómo ha impactado"),
    ("juan", "esto a los clientes"), ("juan", "que ha tenido?"),
    ("andres", "Bueno, principalmente"), ("andres", "el consumo de [tokens],"), ("andres", "se disminuye"),
    ("andres", "al [5] o al [10%]"), ("andres", "de lo que usualmente"), ("andres", "se consumiría."),
    ("andres", "La IA se utiliza"), ("andres", "no para,"), ("andres", "ejecutar acciones,"),
    ("andres", "sino para [orquestar]"), ("andres", "y para [modelar]"), ("andres", "procesos de negocio."),
    ("andres", "Para integrar, por ejemplo,"), ("andres", "se pueden integrar"), ("andres", "periféricos"), ("andres", "como [bodycams],"), ("andres", "como [drones],"),
    ("andres", "como [sensores],"), ("andres", "y en vez de darle"), ("andres", "[datasets] [completos]"), ("andres", "a un BI o así,"),
    ("andres", "se pueden hacer"), ("andres", "análisis muy grandes"), ("andres", "de datos"), ("andres", "con inteligencia artificial"),
    ("andres", "basado en esa"), ("andres", "[lógica] [de] [negocio]."), ("andres", "Entonces, se tiene"), ("andres", "un [pipeline] muy completo"),
    ("andres", "y lo que hemos visto"), ("andres", "es que disminuye"), ("andres", "un montón"), ("andres", "el consumo de [tokens]"),
    ("andres", "y la manera"), ("andres", "en cómo se accede"), ("andres", "a esos datos."),
]

def norm(t):
    return re.sub(r"[^\wáéíóúñü%]", "", t.lower())

def align_lines(words):
    out, i = [], 0
    for who, line in LINES:
        toks = line.split()
        ws = []
        for tk in toks:
            plain = tk.replace("[", "").replace("]", "")
            if i >= len(words):
                raise SystemExit(f"ran out of words at line {line!r}")
            if norm(words[i]["w"]) != norm(plain):
                raise SystemExit(f"mismatch at line {line!r}: transcript {words[i]['w']!r} vs caption {plain!r} (t={words[i]['s']})")
            ws.append({"w": plain, "s": words[i]["s"], "e": words[i]["e"], "accent": tk.startswith("[")})
            i += 1
        out.append({"text": line.replace("[", "").replace("]", ""), "s": ws[0]["s"], "e": ws[-1]["e"], "who": who, "words": ws})
    if i != len(words):
        raise SystemExit(f"{len(words) - i} transcript words left after the last caption line: {[w['w'] for w in words[i:i+8]]}")
    for k, c in enumerate(out):
        nxt = out[k + 1]["s"] if k + 1 < len(out) else c["e"] + 0.6
        c["hold"] = round(min(nxt, c["e"] + 0.6), 3)
    return out

def load_audio():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", JUAN_RAW,
                          "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def highpass(x, fc=75.0):
    from scipy.signal import butter, sosfilt
    sos = butter(2, fc, btype="highpass", fs=SR, output="sos")
    return sosfilt(sos, x).astype(np.float32)

def main():
    x = highpass(load_audio())
    parts, edl, t = [], [], 0.0
    nf = int(FADE * SR)
    for cam, a, b in SPANS:
        s, e = int((a - AUDIO_LAG) * SR), int((b - AUDIO_LAG) * SR)
        seg = x[s:e].copy()
        seg[:nf] *= np.linspace(0, 1, nf)
        seg[-nf:] *= np.linspace(1, 0, nf)
        parts.append(seg)
        edl.append({"cam": cam, "src": round(a, 3), "srcEnd": round(b, 3), "out": round(t, 3), "outEnd": round(t + (b - a), 3)})
        t += b - a
    speech_end = t
    # under the end card: the room's own tone (a measured quiet stretch, src 168.10-169.00) instead of digital silence
    rs, re_ = int((168.10 - AUDIO_LAG) * SR), int((169.00 - AUDIO_LAG) * SR)
    room = x[rs:re_].copy()
    xf = int(0.05 * SR)
    tail = room.copy()
    while len(tail) < int(TAIL * SR):
        ramp = np.linspace(0, 1, xf)
        tail[-xf:] = tail[-xf:] * (1 - ramp) + room[:xf] * ramp
        tail = np.concatenate([tail, room[xf:]])
    tail = tail[: int(TAIL * SR)]
    tail[:xf] *= np.linspace(0, 1, xf)
    fo = int(1.4 * SR)
    tail[-fo:] *= np.linspace(1, 0, fo) ** 2
    parts.append(tail.astype(np.float32))
    y = np.concatenate(parts)
    tmp = os.path.join(HERE, "master_raw.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-ac", "2", "-c:a", "pcm_f32le", tmp], input=y.astype(np.float32).tobytes(), check=True)
    # two-pass loudnorm to -14 LUFS / -1.5 dBTP
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", COMP + ",loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rfind("{"):r.stderr.rfind("}") + 1])
    out = os.path.join(HERE, "master.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af",
                    COMP + f",loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                    f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                    "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
    pub = os.path.join(PUBLIC, "master.wav")
    subprocess.run(["cp", out, pub], check=True)

    # ---------- captions: whisper words mapped through the EDL ----------
    T = json.load(open(os.path.join(DATA, "transcript.json")))
    words = []
    for s in T:
        for w in s["words"]:
            txt = w["w"].strip()
            if not txt or txt in DROP or (txt == "consumen?" and abs(w["s"] - 155.62) < 0.2):  # Juan's cut line tail
                continue
            mid = (w["s"] + w["e"]) / 2
            ov = [(min(w["e"], sp["srcEnd"]) - max(w["s"], sp["src"]), sp) for sp in edl]
            best, sp = max(ov, key=lambda o: o[0])
            if best > 0:
                ws = max(w["s"], sp["src"])
                o = sp["out"] + (ws - sp["src"])
                oe = sp["out"] + (min(w["e"], sp["srcEnd"]) - sp["src"])
                who = "andres"
                if sp["cam"] == "open" and not (ANDRES_IN_OPEN[0] <= mid < ANDRES_IN_OPEN[1]):
                    who = "juan"
                words.append({"w": txt, "s": round(o, 3), "e": round(oe, 3), "who": who})
    # join "10" + "%" style splits
    merged = []
    for w in words:
        if merged and w["w"] in ("%",) :
            merged[-1]["w"] += w["w"]; merged[-1]["e"] = w["e"]; continue
        merged.append(w)
    words = merged

    chunks = align_lines(words)
    # whisper (no VAD) can start a line inside the silence before it: snap each start to the first
    # 10 ms frame of real voice in the finished master
    m = subprocess.run(["ffmpeg", "-v", "error", "-i", out, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True, check=True).stdout
    mm = np.frombuffer(m, np.float32)
    hop = SR // 100
    env = 20 * np.log10(np.sqrt(np.mean(mm[: len(mm) // hop * hop].reshape(-1, hop) ** 2, 1)) + 1e-9)
    def snap(t, limit):
        # if whisper's start lands in silence, move it to where that silence ends
        i = int(round(t * 100))
        if i >= len(env) or env[i] >= -30:
            return None
        while i < len(env) and env[i] < -30:
            i += 1
        return i / 100 if i / 100 < limit else None
    for c in chunks:
        o = snap(c["s"], c["words"][0]["e"])
        if o is not None:
            c["words"][0]["s"] = round(o, 3); c["s"] = round(o, 3)
    for k, c in enumerate(chunks):
        nxt = chunks[k + 1]["s"] if k + 1 < len(chunks) else c["e"] + 0.6
        c["hold"] = round(min(nxt, c["e"] + 0.6), 3)
    ts = EDL_TS
    os.makedirs(os.path.dirname(ts), exist_ok=True)
    with open(ts, "w") as f:
        f.write("// GENERATED by pipeline/build_edl.py. Do not edit by hand.\n")
        f.write(f"export const SPEECH_END = {speech_end:.3f};\nexport const TOTAL = {speech_end + TAIL:.3f};\n")
        f.write(f"export const AUDIO_LAG = {AUDIO_LAG};\n")
        f.write("export type Span = { cam: string; src: number; srcEnd: number; out: number; outEnd: number };\n")
        f.write("export const SPANS: Span[] = " + json.dumps(edl, ensure_ascii=False, indent=1) + ";\n")
        f.write("export type Cap = { text: string; s: number; e: number; hold: number; who: 'juan' | 'andres'; words: { w: string; s: number; e: number; accent: boolean }[] };\n")
        f.write("export const CAPTIONS: Cap[] = " + json.dumps(chunks, ensure_ascii=False, indent=1) + ";\n")
    print("speech", round(speech_end, 2), "total", round(speech_end + TAIL, 2), "chunks", len(chunks))
    for c in chunks:
        print(f"{c['s']:6.2f}-{c['hold']:6.2f} [{c['who'][0]}] {c['text']}")
    for sp in edl:
        print(sp)

if __name__ == "__main__":
    main()
