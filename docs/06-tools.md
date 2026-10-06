# 06. Tools

| Tool | Version / model | What it did here |
| --- | --- | --- |
| Claude Code | Claude Opus 5.5 | Ran the whole build: found the approved carousels and design rules on the machine, verified sync, chose the clip, wrote the pipeline and the Remotion composition, QC'd every render frame by frame, revised from Anwar's notes |
| Remotion | 4.0.490 (React 19) | Renders the video and thumbnails: layout, type, cards, boards, cutout compositing, captions, audio track. `@remotion/fonts` loads the carousels' own font files |
| ffmpeg / ffprobe | system build | Proxies, audio extraction and mastering (high-pass via scipy, `acompressor`, two-pass `loudnorm`), frame grabs for QC, faststart remux |
| faster-whisper | 1.2.1, `large-v3-turbo`, int8 CPU | Spanish transcription with word timestamps for the whole interview |
| OpenCV | 4.13, Haar frontal-face cascade | Face tracking for the sync check and for measuring where faces sit (framing and type placement) |
| NumPy / SciPy | 2.0 / 1.13 | Mouth-motion vs voice cross-correlation, energy profiles for cut points, high-pass filter, caption onset snapping |
| rembg | 2.0.61, `u2net_human_seg` | Per-frame cutout of Andrés for type behind him |
| libvpx-vp9 | via ffmpeg | WebM with an alpha channel for the cutout |
| Pillow | | Logo extraction from the announcement JPEG, contact sheets, thumbnail export |
| Higgsfield (MCP) | GPT Image 2.5, high, 2k, 9:16 | Two documentary photos (drone over a substation, sensor on a pump) in the style of the approved anti-fraud set. 2.75 credits each, 5.5 total. The bodycam photo is reused from the approved 004 carousel |
| Fluyenta demo capture | July 2026 | Real process-designer footage (BPMN canvas) for the "orquestar y modelar procesos" board |
| gh CLI | | This repository |

## Models and services we tried that didn't work

| Tried | Result |
| --- | --- |
| ElevenLabs Music API for an original upbeat bed | Blocked: the key file on the machine holds a key ID, not an `sk_` API key. Paste a real key into `~/.config/elevenlabs/api_key` to compose one |
| Higgsfield music model (Sonilo) | Restricted to Higgsfield's game pipeline |
| Fluyenta AI form-builder capture | Real, but it shows form generation, not data analysis; not used under the analysis line |
| Mouth-motion cross-correlation alone for sync | Correlation around 0.14: points the right way, not precise enough. Lip-closure strips decided it |
