# 04. What we didn't want, and why

Two kinds of entries: corrections Anwar made on this video (with the version that caused them), and standing rules carried
over from earlier Fluyenta, Nixar and Christoph Ott work. Each one cost a revision somewhere. Don't relearn them.

## Corrections on this video

| Don't | Do instead | Why | From |
| --- | --- | --- | --- |
| Show one person as a wide shot cut at the neck over a full-height panel of the other | Frame both people properly | It "looks pretty poor"; an uneven split reads as a mistake | v01 |
| Frame the guest head-and-shoulders, even in a tidy tile | Show his body: head, chest, arms, hands. Tall side-by-side tiles, facing each other | "Show more of his body": he talks with his body, and a floating head looks cheap | v02 |
| Put captions in the middle of the screen | Lower third, one fixed height for the whole video (y 1410) | "They're never in the middle of the screen." Not how the Christoph or Nixar videos work; mid-screen captions cover the subject | v01, v02 |
| Cut the interviewer off at the end of his question, or move his tile away while he's still talking | Let the question finish, leave a natural ~0.4 s, open the guest's tile only when he starts answering | "It doesn't naturally flow into Andrés speaking. It just gets cut." | v01, v02 |
| Remove connectors to save time ("para integrar, por ejemplo,") | Keep the connector and a ~0.5 s breath at sentence boundaries; only cut pure filler ("eh") | Without the connector the next sentence lands abruptly: "he gets cut off unnaturally" | v01, v02 |
| Tighten natural pauses for pace | Leave pauses as spoken; get energy from the visuals | Every tightened pause became another join that sounded clipped | v02 |
| Static cards over a talking head | Integrated motion: real product UI, type behind the speaker, boards, photo tiles, word-by-word captions, a change every 2 to 4 s | The first cut felt flat next to Nixar's UI-cutaway reels; Andrés speaks calmly, so the picture has to carry the energy | v01 |
| Keep the old wordmark | Use "Fluyenta Powered by RunMyProcess" | The brand moved to the new lockup | v02 |
| Light cyan for the blue line | `#0672D8`, sampled from the approved dark sets | Anwar prefers a deeper blue; the approved 002 and 004 sets use exactly this | v01 |

## Things we chose not to do on this video, on purpose

| Don't | Why |
| --- | --- |
| Show the product's AI form builder under "análisis de datos con inteligencia artificial" | It shows form generation, not data analysis; putting it there would misrepresent the product |
| Use ChatGPT- or Claude-branded windows for a Fluyenta ad | Third-party brands in client ads; the real Fluyenta UI is better proof anyway |
| Caption Juan's follow-up "¿Qué casos de éxito ...?" | Its last word transcribes three different ways (conocen / consideras / consumen). We don't caption a guess, so the line is left out |
| Show fake numbers (token counts, costs) | No fake data, ever. The token card only restates Andrés: habitual = 100%, Fluyenta = 5 to 10% |
| Add stock music | Stock tracks read cheap; the generated-music route was blocked (see `06-tools.md`). Voice only, music added at posting |

## Standing rules carried in

From the Fluyenta carousel design rules (2026-09-29):

- Show a concrete operation (who does what, what moves), never generic boxes labelled "workflow".
- One visual language per piece, shared type, logo treatment and palette; no arbitrary theme switches.
- No page counters, decorative badges, unexplained stars or filler labels.
- Blue marks a meaningful phrase, with enough contrast; it never disappears into blue photography.
- Product UI must be real and readable; never label a concept graphic as a product screenshot.
- No stale or unverified claims (no client names without written approval). The client signs off any proof before it is posted.
- Zero em dashes in Fluyenta copy.

From the Christoph Ott and Nixar reels:

- The design system comes from the client's existing artwork; a color theme is not a design system.
- Type over footage is white with a shadow or halo.
- Overlays never share the caption band: move the overlay up, not the captions.
- No text inside overflow-hidden reveal masks (clipped letters and descenders).
- Text and windows inside x 120..960; keep clear of the top UI and the bottom caption UI.
- Never open on black; frame 0 shows the shot and its title.
- No sound effects; music is added at posting.
- Every overlay earns its time: enter with the idea, leave with it.
- Verify lip sync picture-to-source, not just audio-to-audio.
- Deliver H.264 at a phone-friendly bitrate with faststart, under a clean client-facing filename, plus 9:16 and 16:9 thumbnails.

## Process lessons

- **Measure, don't assume.** Sync, face positions, pause lengths, caption onsets and the brand blue were all measured.
  Every time something was eyeballed instead, it came back as a correction.
- **Check every render frame-by-frame at the transitions** (caption collisions during pushes and a cue mapped to the wrong
  caption line were both caught this way).
