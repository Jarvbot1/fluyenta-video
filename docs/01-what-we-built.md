# 01. What we built

## The brief (Anwar, 2026-10-05)

Andrés and Juan recorded a five-minute interview in Spanish on two cameras. Make three to four reels of 60 to 90 seconds, each a
complete idea, themed exactly like the Fluyenta carousels the team has been approving, and combining what works in Nixar's own
reels and the Christoph Ott (Eastwood Montreux) videos. Start with one example.

## Source footage

| File | What it is |
| --- | --- |
| `andres-view.mp4` | Camera on Andrés: 2160x3840, 23.976 fps, 277.97 s. Its audio track is silent (-70 LUFS). |
| `juan-view-audio.mp4` | Camera on Juan: same format and length. Carries the interview audio (lav). |

Both files have the same length and the same 01:00:00:00 timecode: one timeline export. We verified they are already in sync
(within one frame) before cutting anything; see `05-pipeline.md` step 1.

## The interview, mapped into clips

One clip per question. Source seconds:

| Clip | Question | Source range | Content |
| --- | --- | --- | --- |
| 01 | ¿Qué es Fluyenta? / ¿Qué es BPMN? | 4.96 to 83.94 | BPMN enriched with AI; boxes are procedures, diamonds are decisions |
| 02 | ¿Qué aporta Fluyenta al mercado? | 84.58 to 140.28 | AI, no-code, low-code; Fluyenta gives AI security limits so it follows business logic; ends "esa es la magia de Fluyenta". False start at 99 to 121 s to cut. |
| **03** | **¿Cómo ha impactado esto a los clientes?** | **142.86 to 213.36** | **Token use drops to 5 to 10%; AI orchestrates, it doesn't execute; bodycams, drones, sensors; logic-driven analysis instead of whole datasets in a BI. Built.** |
| 04 | ¿Cómo afecta a los negocios? | 213.58 to 272.82 | Business impact: operating cost, documenting edge cases, how fast a business can be mapped |

Clip 03 opens with Juan's closing line from clip 02 ("solo que la IA afecte lo que tiene que afectar, tocar lo que tiene que
tocar...") because it gives "esto" in his next question something to refer to. Clip 02 still ends cleanly on "esa es la magia".

`pipeline/transcribe.py` produces the whole-interview transcript (faster-whisper, word timestamps); it is not included here.

## Clip 03 as delivered (v03)

67.8 s, 1080x1920, 30 fps, -14.8 LUFS, voice only. Delivered as `Fluyenta Entrevista Andrés - Tokens.mp4` with a 9:16 and a
16:9 thumbnail.

Edit list (only two filler cuts):

| Output | Source | Speech |
| --- | --- | --- |
| 0.00 to 11.09 | 142.86 to 153.95 | Juan's summary, Andrés "Correcto, sí", Juan's question; ends with a natural 0.37 s pause |
| 11.09 to 23.77 | 155.72 to 168.40 | "Bueno, principalmente el consumo de tokens... al 5 o al 10%... La IA se utiliza no para," |
| 23.77 to 30.65 | 169.92 to 176.80 | "ejecutar acciones, sino para orquestar y para modelar procesos de negocio." (cut: one "eh") |
| 30.65 to 64.03 | 179.98 to 213.36 | "Para integrar, por ejemplo, se pueden integrar periféricos... esos datos." (cut: "Eh, y, eh,") |
| 64.03 to 67.83 | | Closing card over the room's own tone |

Beat sheet:

| Time | Picture |
| --- | --- |
| 0 to 11.1 | Two tall video tiles side by side, facing each other (Juan left, Andrés right), active-speaker ring, name chips. Headline "¿Cuántos tokens / gasta tu IA?" |
| 11.1 to 11.7 | Andrés' tile opens to full screen as he starts answering |
| 15.4 | "5–10%" rises from behind his head onto the wall (person cutout), then the token card (habitual 100% vs Fluyenta 5–10%) |
| 20.5 | Medium framing, headline "La IA no ejecuta." |
| 23.8 | Wide framing, card "Ejecutar acciones", struck through on "sino" |
| 26.6 | Board: the real Fluyenta process designer in a browser window (portal.runmyprocess.com), "Orquesta." lands, chips "Orquestar" / "Modelar procesos de negocio" |
| 30.7 | Back to Andrés, headline "Del campo / al proceso." |
| 34.0 | Three photo tiles pop in on "periféricos"; the bodycam tile opens into full-bleed photos, one per spoken word: Bodycams, Drones, Sensores |
| 39.6 | Board: "Todos los registros" streaming into a live BI window, headline "¿Todo el dataset / a un BI?" |
| 47.6 | Andrés with the logic card: rows into a BPMN gateway "Lógica de negocio", only the picked rows flow on to the AI |
| 54.0 | Medium framing, pipeline card: Periféricos, Lógica de negocio, IA |
| 57.6 | "Menos / tokens." behind Andrés, token card again |
| 64.1 | Closing card: "Empieza con / un proceso.", "Muéstranos el proceso que tu equipo quiere mejorar.", Agenda una consulta / fluyenta.com, large lockup |

## Versions

| Version | What changed | Feedback |
| --- | --- | --- |
| v01 | First cut: headline over Andrés with Juan's camera docked in the lower half, white cards, photo slides, mid-screen captions | Opening split looked poor (Andrés cut at the neck over all of Juan); wanted more upbeat, immersive, integrated motion, like the UI cutaways in his Nixar reels |
| v02 | Video-call tiles, type behind Andrés, real product board, BI board, photo tiles, word-by-word captions, tighter pauses | "A lot better", but: still only Andrés' head in the opening; Juan cut off; unnatural cut before the bodycams line; captions mid-screen; use the new logo |
| v03 | Tall side-by-side tiles showing bodies, natural joins, pauses restored, captions in the lower third, new lockup, cue times derived from captions | Awaiting review |

