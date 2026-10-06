# 05. Pipeline: from two camera files to the reel

Requirements: macOS (proxies use VideoToolbox; swap in libx264 elsewhere), ffmpeg, Node 20+, Python 3.9+ with
`faster-whisper`, `rembg`, `opencv-python`, `numpy`, `scipy`, `Pillow`.

```bash
npm install
export FLUYENTA_SRC=~/Downloads   # holds andres-view.mp4 and juan-view-audio.mp4
```

Heavy files are gitignored and rebuilt by these steps: `public/fluyenta-interview/{andres_hi.mp4, juan_hi.mp4,
andres_cut.webm, master.wav}`.

## 1. Verify sync (once per source pair)

Andrés' camera has no usable audio, so sync is checked against his lips.

```bash
python3 pipeline/transcribe.py                                   # also writes pipeline/work/interview_16k.wav
python3 pipeline/sync/mouth_motion.py "$FLUYENTA_SRC/andres-view.mp4" pipeline/work/mouth_andres.npy
python3 pipeline/sync/mouth_motion.py "$FLUYENTA_SRC/juan-view-audio.mp4" pipeline/work/mouth_juan.npy
python3 pipeline/sync/sync_check.py
```

`sync_check.py` cross-correlates mouth motion (Haar face track, lower-face frame difference minus upper-face motion) with the
voice envelope while each person speaks. That gives a coarse answer (it peaked within two frames of zero). The deciding check
is lip closures on "b" words: `python3 pipeline/sync/lip_strips.py 6.0 7.0 88.3 89.3` pulls 4K mouth crops around the audio
onset of a "Bueno" after silence; read the frame where the lips part. Three checks (6.7 s, 89.1 s, 155.8 s) all landed within one frame, so the files are in sync with no drift. The
pipeline still lays audio 30 ms behind the picture as a margin.

## 2. Transcribe

`pipeline/transcribe.py`: faster-whisper `large-v3-turbo`, Spanish, int8 on CPU, word timestamps, a short domain prompt
(Fluyenta, BPMN, low-code, ERP). Output: `pipeline/data/transcript.json` (not committed; run this first). About 2.5 minutes for the whole interview.
For any line that comes back strange, re-run it alone on a tight clip; if it still varies, don't caption a guess.

## 3. Camera proxies

```bash
bash pipeline/make_proxies.sh
```

1620x2880 proxies of the clip range only (source 140 s plus 76 s). 1.5x resolution keeps the 1.2x framing sharp; trimming
keeps Remotion fast. Proxy time t equals source 140 + t, frame-exact (checked by pixel-matching proxy frames to the original).

## 4. Edit list, master audio, captions

```bash
python3 pipeline/build_edl.py
```

Edit `SPANS` (source in/out seconds) and `LINES` (hand-written caption lines, `[word]` marks an azure keyword) at the top of
the script. It:

1. Cuts the spans from the interview audio, 8 ms fades at every cut, 75 Hz high-pass, light compression, two-pass loudnorm
   to -14 LUFS, the room's own tone under the closing card.
2. Maps every transcript word through the edit list, aligns the hand-written lines to them word by word (it stops on any
   mismatch), and snaps line starts that fall in silence to the real voice onset.
3. Writes `public/fluyenta-interview/master.wav` and `src/fluyenta-interview/edl.ts`.

Choosing cut points: only in measured silence (print a 10 ms energy profile around each candidate). Only remove pure filler.
Keep connectors and natural breaths. With the 30 ms audio lag, start each span a few frames past any trimmed tail so no
syllable leaks in. After building, measure the pause at each join in the master; 0.35 to 0.6 s sounds natural.

## 5. Person cutout

```bash
python3 pipeline/build_cutout.py
```

rembg `u2net_human_seg` on every frame of Andrés' proxy (mask at 540x960, upscaled, eroded 1 px, blurred 1.2 px), written as a
VP9 WebM with alpha that lines up frame for frame with `andres_hi.mp4`. About 10 minutes for 1823 frames.

## 6. Preview and stills

```bash
npm run studio
npm run stills -- 0 11.4 15.6 27 35 41 49 58 66
```

Look at every still at full size: faces clear of type, captions at y 1410 and clear of cards, nothing past x 120..960, no
clipped letters, every card on the sentence it illustrates.

## 7. Render

```bash
npm run render          # out/fluyenta-interview-03.mp4
npm run thumbs          # out/thumb-9x16.png, out/thumb-16x9.png
ffmpeg -i out/fluyenta-interview-03.mp4 -c copy -movflags +faststart "Fluyenta Entrevista Andrés - Tokens.mp4"
```

Keep Remotion's own H.264 stream (full range, bt601): it matches the design stills exactly and is the same encoding as the
reels already posted. Re-encoding to tv range shifted the colors by 2 to 4 levels.

The render scripts delete their temp bundle when they finish: Remotion copies all of `public/` into $TMPDIR on every bundle
and never cleans it up.

## 8. QC before anything ships

- Frames at every transition (morph, board pushes in and out, photo tile opening, closing card): no caption collisions, no
  half-drawn elements.
- Picture-to-source: at several output times, transform the source frame with the shot's framing and pixel-match it; the best
  match should be offset 0 (or -1 frame, from Remotion vs ffmpeg frame picking).
- Loudness about -14 LUFS, peaks under -1 dBTP, no silent gaps over 2.5 s, frame 0 not black.
- A full contact sheet every 2 s, read top to bottom.

## Making clips 01, 02 and 04

1. Pick the source range from `01-what-we-built.md`.
2. Re-cut proxies if the range falls outside source 140 to 216 s (change `-ss` / `-t` in `make_proxies.sh` and
   `PROXY_START` in the composition), and re-run the cutout.
3. New `SPANS` and `LINES` in `build_edl.py`, rebuild.
4. In `FluyentaInterview.tsx`, replace the beat constants (headlines, cards, boards) with ones for the new content; they look up
   their times from caption text, so only the words and visuals change.
5. Give each clip its own visual moments (clip 01: BPMN shapes; clip 04: its business-impact numbers, once the client signs them off), not a copy of clip 03.
