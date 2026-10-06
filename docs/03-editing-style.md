# 03. Editing style

The aim Anwar set: upbeat, immersive and integrated, like the UI cutaways in Nixar's own reels, even though Andrés speaks
calmly and fairly low. The picture changes every 2 to 4 seconds; graphics live inside the footage rather than on top of it.

## Canvas and safe zones

- 1080x1920 at 30 fps (the sources are 23.976; Remotion picks frames by time).
- Text, windows and cards inside x 120..960 (Instagram crops about 100 px off each side on tall phones).
- Nothing important in the top ~180 px or under the Instagram caption UI (bottom ~300 px).
- Frame 0 shows the shot and its headline. Never open on black.

## Layout system

| Zone | y (px) | What lives there |
| --- | --- | --- |
| Logo | 180 to 257 | The lockup, every shot |
| Headline | 292 to 458 | Two-line Schibsted headline, changes per idea |
| Face | ~540 to 900 | Andrés; type behind him rises from here |
| Cards | 960 to ~1380 | White cards, photo tiles |
| Captions | 1410 to 1470 | One line, lower third, same height in every shot |
| Instagram UI | 1620+ | Nothing important |

## The opening

Two tall rounded tiles side by side, facing each other the way they sat: Juan on the left (head to lap), Andrés on the right
(head, chest, arms and hands). An azure ring marks whoever is speaking; each tile has a name chip. Juan finishes his question,
a natural pause, and Andrés' tile opens to full screen as he starts answering (the tile rect and the framing interpolate
together into the camera shot, so it lands exactly on the next frame).

## Camera framing

Andrés' camera is a wide shot, so we cut between two framings of it:

- **W**: native framing, slow 3.5% push.
- **M**: 1.2x, face centred at (540, 740), slow 3% push. The proxies are 1.5x resolution, so M stays sharp.
- **Punch hits**: a quick spring zoom (+6%) on the key words: "al 5 o al 10%", "con inteligencia artificial", "el consumo de tokens".

Every cut in the audio sits under a framing change, a board, the photo sequence or the opening morph, so no jump is ever seen.

## Type behind the speaker

A per-frame cutout of Andrés (rembg) is laid over big type, so "5–10%" and "Menos / tokens." sit on the wall behind his head.
Layer order: camera, upper scrim, type, cutout, lower scrim. The scrim is split into two layers that composite back to the
original gradient, with a soft hand-off between 420 and 540 px, so the type stays crisp white and the cutout shows no seam.

## Boards (full-frame cutaways)

Pushes up from below (0.32 s), and the next shot pushes in the same way:

- **Process designer**: real Fluyenta footage (`bpmn.mp4`, from the team's demo capture) in a browser window, slow push toward
  the Decision gateway, chips "Orquestar" / "Modelar procesos de negocio" popping on the words.
- **Dataset to BI**: "Todos los registros" streaming upward fast, flow lines pouring into a live BI chart.

## Photos

On "periféricos" three photo tiles pop in over Andrés; on "como bodycams" the first tile opens to full frame, then a cut per
word (drones, sensores) with a light settle. Title stack bottom-left: "Periféricos conectados / Bodycams. Drones. Sensores.",
the current word in azure.

## Cards

Each card illustrates the sentence it sits under, timed to its words:

- Token card: "Uso habitual" fills to 100%, "Con Fluyenta" fills to 5% with a band to 10%.
- Role card: "Ejecutar acciones", struck through on "sino".
- Logic card: rows shimmer, a BPMN gateway "Lógica de negocio" appears on "análisis", the IA box on "inteligencia artificial",
  and on "basado en esa lógica de negocio" only three rows turn blue and dots travel through the gateway to the IA.
- Pipeline card: Periféricos, Lógica de negocio, IA, with dots running along the arrows.

## Captions

Lower third (y 1410), one line, centred, Schibsted 650 at 46 px, white with a navy halo. Words appear on their spoken onset
(onsets snapped to the voice in the master), keywords in azure. Juan's lines are a softer white. Hidden during the photo
sequence (the title stack carries it), during pushes, and on the closing card.

## Motion

Springs with slight overshoot for entrances (damping ~13), ease-outs for exits, staggered lines. Text never sits inside an
overflow-hidden reveal (clipped letters); it moves by translate and fade.

## Audio

Original lav audio only: 75 Hz high-pass, light compression, two-pass loudnorm (-14.8 LUFS integrated, -1.4 dBTP), 8 ms fades
at every cut, the room's own tone under the closing card. Audio sits 30 ms behind the picture (late audio is invisible, early
audio reads as bad lip sync). No music, no sound effects.

## Timing

Every cue in `FluyentaInterview.tsx` looks up its time from the caption line it belongs to (`lineAt`, `wordAt`). Change the
edit list, rebuild `edl.ts`, and every animation follows.
