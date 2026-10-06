import json, os, subprocess, sys, time
from paths import JUAN_RAW, WORK, DATA
from faster_whisper import WhisperModel
t=time.time()
wav = os.path.join(WORK, "interview_16k.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", JUAN_RAW, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=8)
segs, info = m.transcribe(wav, language="es", word_timestamps=True,
    vad_filter=False, beam_size=5, condition_on_previous_text=True,
    initial_prompt="Entrevista sobre Fluyenta, RunMyProcess, automatización de procesos, flujos de trabajo, low-code, inteligencia artificial, ERP, SAP.")
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"w":w.word,"s":w.start,"e":w.end,"p":w.probability} for w in (s.words or [])]})
    print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text}", flush=True)
json.dump(out, open(os.path.join(DATA, "transcript.json"), "w"), ensure_ascii=False, indent=1)
print("done", time.time()-t)
