# Fluyenta interview reels

Short Spanish reels cut from a five-minute, two-camera interview: **Andrés Murcia** (Fluyenta) answering **Juan**'s questions.
Built by Nixar Solutions in October 2026. The first clip, *"¿Cuántos tokens gasta tu IA?"*, is done (v03, 67.8 s, 9:16).

The look is the approved Fluyenta carousel system in motion: Schibsted Grotesk headlines with a blue second line, Geist body,
white record cards, the "Fluyenta Powered by RunMyProcess" lockup. The footage gets real Fluyenta product UI, type set on the
wall behind Andrés, and word-by-word captions in the lower third.

## What's in here

| Path | What it is |
| --- | --- |
| `docs/01-what-we-built.md` | The deliverable, the clip map of the whole interview, version history |
| `docs/02-brand-system.md` | Fonts, colors, logo, cards, where every token came from |
| `docs/03-editing-style.md` | Layouts, framing, motion, captions, beat by beat |
| `docs/04-what-we-didnt-want.md` | Every correction and rule, with the reason |
| `docs/05-pipeline.md` | How to reproduce the video from the two camera files, step by step |
| `docs/06-tools.md` | Every tool, model and service used, what each one did, what was blocked |
| `src/fluyenta-interview/` | Remotion compositions (video + 9:16 / 16:9 thumbnails) and the generated edit list `edl.ts` |
| `pipeline/` | Python prep: sync check, transcription, edit list + master audio, camera proxies, person cutout |
| `public/fluyenta-interview/` | Small assets in git: fonts, logos, photos, product capture, thumbnail frame |
| `scripts/` | Render scripts (video, stills, thumbnails) |

## Quick start

```bash
npm install
export FLUYENTA_SRC=~/Downloads          # folder with andres-view.mp4 and juan-view-audio.mp4
bash pipeline/make_proxies.sh            # camera proxies (heavy, gitignored)
python3 pipeline/transcribe.py           # interview transcript (not included in the repo)
python3 pipeline/build_edl.py            # master audio + src/fluyenta-interview/edl.ts
python3 pipeline/build_cutout.py         # Andrés cut out of his camera (VP9 alpha, ~10 min)
npm run studio                           # preview
npm run render                           # out/fluyenta-interview-03.mp4
npm run thumbs                           # out/thumb-9x16.png, out/thumb-16x9.png
```

Full detail, including the checks to run before anything ships: `docs/05-pipeline.md`.

## Notes

- On-screen numbers only restate what Andrés says on camera ("se disminuye al 5 o al 10% de lo que usualmente se consumiría").
- Voice only, no music: a track is added at posting time.
- The raw camera files, the full interview transcript and the rendered media are not in this repo.
