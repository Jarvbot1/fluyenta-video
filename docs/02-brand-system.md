# 02. Brand system

Rule one: the design system comes from the client's approved artwork, not from taste. Every token below was lifted from the
approved Fluyenta carousels' own source files or sampled from their exported PNGs.

## Reference set

Five approved Fluyenta carousels:

| Carousel | Status | Used for |
| --- | --- | --- |
| 001 Glass v12 | Approved 2026-09-14 | Dark photo slides, CTA split button |
| 002 Global v04 | Approved 2026-09-08 | The blue on dark backgrounds (#0672D8) |
| 003 Product Shots v05 | Approved 2026-09-08 | Real product UI inside a browser window, URL pill portal.runmyprocess.com |
| 004 Anti-fraud v08 | Approved 2026-09-18 | Navy scrims over photography, the blue (#0672D8), the bodycam photo itself |
| 011 ERP v06 | Endorsed by the client's design team | White record cards with clear data hierarchy |

015 Shipment Visibility v07 (latest set, not formally approved) informed card details only.

The rules that govern all of it come from the Fluyenta design-rules handoff (2026-09-29).
The parts that mattered most here: show a concrete operation, not abstract boxes; one coherent visual language per piece;
blue marks a meaningful phrase; no counters, badges or filler labels; never fabricate claims or screenshots.

## Type

Two families only, using the carousels' own font files (`public/fluyenta-interview/fonts/`, both SIL OFL):

| Role | Font | Settings |
| --- | --- | --- |
| Headlines | Schibsted Grotesk | 750, letter-spacing -0.043em, 80 px on camera, 112 px on the closing card |
| Type behind Andrés | Schibsted Grotesk | 750, 300 px ("5–10%"), 196 px ("Menos / tokens.") |
| Captions | Schibsted Grotesk | 650, 46 px, white with a navy halo |
| Card labels, body, chips | Geist | 500 to 600, 19 to 36 px |

Both files cover Spanish (á é í ó ú ñ ¿ ¡). Headlines are always two lines: white first line, blue second line, as on the
carousel covers.

## Color

| Token | Value | Source |
| --- | --- | --- |
| Blue (headline second line, card values, CTA) | `#0672D8` | Sampled from approved 002 and 004 PNGs (0,112,216). Anwar asked for a deeper blue than the early cyan. |
| Azure (caption keywords, rings, small accents) | `#0C97FF` | The logo mark |
| Navy (backgrounds, boards) | `#081722` | 004 slide background |
| Scrim | `rgba(3,21,38, 0.88 to 0)` | 004 / 015 photo slides |
| Ink on cards | `#09243C` | 015 cards |
| Muted on cards | `#536779` | 015 eyebrows |
| Pale label on dark | `#B7D9FA` | 015 GPS slide |

## Logo

`public/fluyenta-interview/logo2/fluyenta-rmp-white.png` (and `-dark.png` for light backgrounds): the new lockup
"Fluyenta / Powered by RunMyProcess". Extracted from the "RunMyProcess is now Fluyenta" announcement graphic because no
vector file was supplied. Top-left at 330 px wide on every shot, 560 px on
the closing card. If the team sends an SVG, swap it in at the same paths.

The older wordmark (`logo-white.svg`, byte-identical to the carousels' logo) is kept for reference only.

## Surfaces and components

- **Cards**: white, 24 px radius, padding 32/38, shadow `0 25px 70px rgba(6,24,39,.30)`. Eyebrow in Geist muted, values in
  Schibsted, blue for the number that matters. Cards sit at y 960, always above the caption band.
- **Boards**: navy page with two faint blue radial glows; content windows are white with 18 px radius.
- **Browser window**: macOS chrome (traffic lights, lock icon, URL pill `portal.runmyprocess.com`), as in the approved 003 set.
- **CTA**: blue box `Agenda una consulta →` joined to an outlined `fluyenta.com` box (the 002/003 split button), radius 10.

## Copy

- Spanish, short, concrete. Headlines restate what Andrés says, never more.
- Zero em dashes; the en dash in "5–10%" is a range, not punctuation.
- Claims only from his own words on camera. No client names, no invented numbers.
