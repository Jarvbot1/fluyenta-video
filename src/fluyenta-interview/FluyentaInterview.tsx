import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { CAPTIONS, SPANS, SPEECH_END, TOTAL, type Cap } from "./edl";

// Fluyenta interview, clip 03: "¿Cómo ha impactado a los clientes?" (Andrés Murcia, interviewed by Juan). v02.
// The approved carousel system in motion (Schibsted 750 + Geist, #0672D8 line, white record cards, real logo),
// now more integrated: a framed two-person split that opens into Andrés, type set on the wall BEHIND him
// (per-frame cutout), real Fluyenta product footage, boards for the dataset story, word-by-word captions.
// Audio = work/master.wav from build_edl.py (pauses tightened; every cut sits under a layout change).

export const FI_FPS = 30;
export const FI_FRAMES = Math.round(TOTAL * FI_FPS);
const FPS = FI_FPS;
const F = (s: number) => Math.round(s * FPS);
const A = (p: string) => staticFile(`fluyenta-interview/${p}`);
const PROXY_START = 140; // andres_hi / juan_hi / andres_cut start at source 140 s

loadFont({ family: "Schibsted", url: A("fonts/schibsted-grotesk-latin.woff2"), weight: "100 900" });
loadFont({ family: "Geist", url: A("fonts/geist-latin.woff2"), weight: "100 900" });

// ---------- tokens ----------
const NAVY = "#081722";
const INK = "#09243C";
const MUTED = "#536779";
const BLUE = "#0672D8"; // the blue of the approved dark sets (002, 004), sampled from their PNGs
const AZURE = "#0C97FF"; // logo azure: caption keywords, rings, small type over footage
const PALE = "#B7D9FA";
const FOOT = "#D5E5EF";
const L = 120;
const W = 840;
const HEAD_TOP = 292;
const HEAD_SIZE = 80;
const CAP_TOP = 1410; // captions live in the lower third, one height for the whole video (Christoph / Nixar placement)
const CARD_TOP = 960; // cards sit above the caption band, never in it
const DISPLAY: React.CSSProperties = { fontFamily: "Schibsted", fontWeight: 750, letterSpacing: "-0.043em" };
const SHADOW_TXT = "0 3px 10px rgba(2,14,26,0.45)";
const HALO = "0 2px 3px rgba(3,21,38,0.6), 0 0 18px rgba(3,21,38,0.7)";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const useT = () => useCurrentFrame() / FPS;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const spr = (t: number, at: number, damping = 13, stiffness = 170, mass = 0.9) =>
  t < at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: { damping, stiffness, mass } });
const rise = (t: number, at: number, dur = 0.38, dist = 26) => {
  const p = interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: easeOut });
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};
const pop = (t: number, at: number, dist = 34) => {
  const s = spr(t, at);
  const o = interpolate(t, [at, at + 0.16], [0, 1], clamp);
  return { opacity: o, transform: `translateY(${(1 - s) * dist}px) scale(${0.94 + 0.06 * s})` };
};
const fadeOut = (t: number, at: number, dur = 0.24, dist = -18) => {
  const p = interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: easeInOut });
  return { opacity: 1 - p, transform: `translateY(${p * dist}px)` };
};
const merge = (a: { opacity: number; transform: string }, b: { opacity: number; transform: string }) => ({
  opacity: a.opacity * b.opacity,
  transform: `${a.transform} ${b.transform}`,
});

// ---------- timeline ----------
const srcAt = (out: number) => {
  const sp = SPANS.find((s) => out >= s.out && out < s.outEnd) ?? SPANS[SPANS.length - 1];
  return sp.src + (out - sp.out);
};

// beat times come from the caption lines they belong to, so they follow any change to the edit list
const capOf = (start: string, after = -1) => {
  const c = CAPTIONS.find((x) => x.s > after && x.text.startsWith(start));
  if (!c) throw new Error(`caption not found: ${start}`);
  return c;
};
const lineAt = (start: string, after = -1) => capOf(start, after).s;
const wordAt = (start: string, word: string) => {
  const w = capOf(start).words.find((x) => x.w.toLowerCase().startsWith(word));
  if (!w) throw new Error(`word not found: ${word}`);
  return w.s;
};
const MORPH = [SPANS[1].out - 0.02, SPANS[1].out + 0.63] as const; // Andrés' tile opens as he starts answering
const NUM_AT = lineAt("al 5"); // "al 5 o al 10%"
const IA_LINE = lineAt("La IA se utiliza");
const BOARD1 = [lineAt("sino para orquestar") - 0.1, SPANS[3].out] as const; // real process designer
const TILES_AT = lineAt("periféricos");
const PHOTO_IN = lineAt("como bodycams");
const PHOTO_OUT = lineAt("y en vez de darle") - 0.42; // push to the BI board lands before "y en vez"
const BI = [PHOTO_OUT, lineAt("se pueden hacer") - 0.3] as const;
const THEN_AT = lineAt("Entonces");
const VISTO_AT = lineAt("y lo que hemos visto");
const LESS_AT = lineAt("es que disminuye");
const TOK_AT = lineAt("el consumo de tokens", LESS_AT); // the second time he says it
const END_AT = SPEECH_END + 0.1;
const PUSH = 0.32;

type Framing = "W" | "M";
type Shot = { a: number; b: number; framing: Framing; hits?: number[] };
// every cut (19.39, 23.07, 29.67, 48.11, 50.73) changes framing or sits under a board / photo / morph
const SHOTS: Shot[] = [
  { a: SPANS[1].out, b: IA_LINE, framing: "W", hits: [NUM_AT] },
  { a: IA_LINE, b: SPANS[2].out, framing: "M" },
  { a: SPANS[2].out, b: BOARD1[0] + 0.45, framing: "W" },
  { a: SPANS[3].out, b: PHOTO_IN + 0.5, framing: "M" },
  { a: BI[1] - 0.1, b: THEN_AT, framing: "W", hits: [lineAt("con inteligencia")] },
  { a: THEN_AT, b: VISTO_AT, framing: "M" },
  { a: VISTO_AT, b: END_AT + 0.6, framing: "W", hits: [TOK_AT] },
];
// windows where type sits behind Andrés (cutout rendered on top)
const BEHIND: [number, number][] = [
  [NUM_AT - 0.05, IA_LINE],
  [LESS_AT - 0.05, END_AT + 0.6],
];

const FACE = { x: 465, y: 742 }; // Andrés' face centre in 1080x1920 frame space
type Xf = { s: number; tx: number; ty: number };
const shotXf = (shot: Shot, t: number): Xf => {
  const prog = interpolate(t, [shot.a, shot.b], [0, 1], clamp);
  const base = shot.framing === "W" ? 1 : 1.2;
  const target = shot.framing === "W" ? FACE : { x: 540, y: 740 };
  let s = base * (1 + (shot.framing === "W" ? 0.035 : 0.03) * prog);
  for (const h of shot.hits ?? []) s *= 1 + 0.06 * spr(t, h, 16, 200);
  return { s, tx: target.x - s * FACE.x, ty: target.y - s * FACE.y };
};
const xfCss = (x: Xf) => `translate(${x.tx}px, ${x.ty}px) scale(${x.s})`;

const Video: React.FC<{ file: string; outStart: number; transparent?: boolean; style?: React.CSSProperties }> = ({ file, outStart, transparent, style }) => (
  <OffthreadVideo
    src={A(file)}
    startFrom={Math.max(0, Math.round((srcAt(outStart) - PROXY_START) * FPS))}
    muted
    transparent={transparent}
    style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, ...style }}
  />
);

// ---------- type on the wall behind Andrés ----------
const BehindType: React.FC<{ t0: number }> = ({ t0 }) => {
  const t = useT() + t0; // rendered inside a shot Sequence: convert to video time
  if (t >= NUM_AT - 0.05 && t < IA_LINE) {
    const s = spr(t, NUM_AT, 12, 150);
    const ex = fadeOut(t, IA_LINE - 0.24, 0.22, -20);
    return (
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: ex.opacity }}>
        <div style={{ position: "absolute", left: L, top: 268, width: W, textAlign: "center", fontFamily: "Geist", fontWeight: 600, fontSize: 36, color: AZURE, textShadow: SHADOW_TXT, ...rise(t, NUM_AT + 0.22) }}>
          del consumo habitual de tokens
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 300,
            textAlign: "center",
            ...DISPLAY,
            fontSize: 300,
            lineHeight: 1,
            letterSpacing: "-0.06em",
            color: "#FFFFFF",
            whiteSpace: "nowrap",
            textShadow: "0 8px 30px rgba(2,14,26,0.35)",
            opacity: interpolate(t, [NUM_AT, NUM_AT + 0.12], [0, 1], clamp),
            transform: `translateY(${(1 - s) * 260}px) scale(${0.9 + 0.1 * s})`,
          }}
        >
          5–10%
        </div>
      </div>
    );
  }
  if (t >= LESS_AT - 0.05) {
    const line: React.CSSProperties = { ...DISPLAY, fontSize: 196, lineHeight: 0.98, letterSpacing: "-0.055em", whiteSpace: "nowrap", textAlign: "center", width: 1080, position: "absolute", left: 0, textShadow: "0 8px 30px rgba(2,14,26,0.35)" };
    const s1 = spr(t, LESS_AT, 12, 150);
    const s2 = spr(t, TOK_AT, 12, 150);
    return (
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
        <div style={{ ...line, top: 246, color: "#FFFFFF", opacity: interpolate(t, [LESS_AT, LESS_AT + 0.12], [0, 1], clamp), transform: `translateY(${(1 - s1) * 220}px) scale(${0.92 + 0.08 * s1})` }}>Menos</div>
        <div style={{ ...line, top: 424, color: BLUE, opacity: interpolate(t, [TOK_AT, TOK_AT + 0.12], [0, 1], clamp), transform: `translateY(${(1 - s2) * 220}px) scale(${0.92 + 0.08 * s2})` }}>tokens.</div>
      </div>
    );
  }
  return null;
};

const CameraShot: React.FC<{ shot: Shot }> = ({ shot }) => {
  const t = useT() + shot.a;
  const x = shotXf(shot, t);
  const behind = BEHIND.find(([a, b]) => a < shot.b && b > shot.a);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: xfCss(x) }}>
        <Video file="andres_hi.mp4" outStart={shot.a} />
      </div>
      <ScrimUpper />
      {behind && <BehindType t0={shot.a} />}
      {behind && (
        <Sequence from={F(Math.max(behind[0], shot.a) - shot.a)} durationInFrames={F(Math.min(behind[1], shot.b) - Math.max(behind[0], shot.a))} layout="none">
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: xfCss(x) }}>
            <Video file="andres_cut.webm" outStart={Math.max(behind[0], shot.a)} transparent />
          </div>
        </Sequence>
      )}
      <ScrimLower />
    </AbsoluteFill>
  );
};

// the camera scrim in two layers that composite to the original gradient (handoff 420-540 px, no seam). Type behind Andrés sits
// between the upper part and his cutout, the lower parts go over everything (no brightness pop on the cutout)
const ScrimUpper: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,21,38,0.88) 0px, rgba(3,21,38,0.74) 360px, rgba(3,21,38,0.593) 420px, rgba(3,21,38,0.349) 480px, rgba(3,21,38,0) 540px)" }} />
);
const ScrimLower: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,21,38,0) 420px, rgba(3,21,38,0.15) 480px, rgba(3,21,38,0.30) 540px, rgba(3,21,38,0.0) 690px)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(3,21,38,0.62) 0px, rgba(3,21,38,0.0) 420px)" }} />
  </>
);
const Scrims: React.FC = () => (
  <>
    <ScrimUpper />
    <ScrimLower />
  </>
);

// ---------- opening: two framed tiles (video-call split), then Andrés opens to full screen ----------
// tall side-by-side tiles, facing each other as they sat: Juan left, Andrés right.
// Both show their bodies: Juan head to lap (0.52), Andrés head, chest, arms and hands (0.72).
const TILE_J = { x: L, y: 500, w: 408, h: 870 };
const TILE_A = { x: 552, y: 500, w: 408, h: 870 };
const juanXf = (): Xf => ({ s: 0.52, tx: -163 * 0.52, ty: -247 * 0.52 });
const andresTileXf = (): Xf => ({ s: 0.72, tx: -277 * 0.72, ty: -416 * 0.72 });
const ANDRES_SAYS = [lineAt("Correcto") - 0.08, lineAt("Correcto") + 0.9] as const;
const speaking = (t: number) => (t >= ANDRES_SAYS[0] && t < ANDRES_SAYS[1] ? "andres" : t < SPANS[1].out ? "juan" : "andres");

const Tile: React.FC<{
  rect: { x: number; y: number; w: number; h: number };
  radius: number;
  active: boolean;
  ringOpacity?: number;
  label?: string;
  labelOpacity?: number;
  children: React.ReactNode;
}> = ({ rect, radius, active, ringOpacity = 1, label, labelOpacity = 1, children }) => (
  <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: radius, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
    {children}
    <div style={{ position: "absolute", inset: 0, background: "rgba(8,23,34,0.28)", opacity: active ? 0 : 1 }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: radius, boxShadow: `inset 0 0 0 4px ${AZURE}`, opacity: ringOpacity }} />
    {label && (
      <div
        style={{
          position: "absolute",
          left: 22,
          top: 22,
          padding: "10px 16px",
          borderRadius: 10,
          background: "rgba(8,23,34,0.62)",
          color: "#FFFFFF",
          fontFamily: "Geist",
          fontWeight: 550,
          fontSize: 25,
          whiteSpace: "nowrap",
          opacity: labelOpacity,
        }}
      >
        {label}
      </div>
    )}
  </div>
);

const Opening: React.FC = () => {
  const t = useT();
  if (t > MORPH[1] + 0.02) return null;
  const sp = speaking(t);
  // the active ring eases between speakers instead of snapping
  const [s0, s1] = ANDRES_SAYS;
  const turn = SPANS[1].out;
  const ringJ = interpolate(t, [0, s0, s0 + 0.15, s1, s1 + 0.15, turn - 0.1, turn], [1, 1, 0, 0, 1, 1, 0], clamp);
  const ringA = interpolate(t, [s0, s0 + 0.15, s1, s1 + 0.15, turn - 0.1, turn + 0.05], [0, 1, 1, 0, 0, 1], clamp);
  const p = interpolate(t, [MORPH[0], MORPH[1]], [0, 1], { ...clamp, easing: easeInOut });
  const rect = { x: lerp(TILE_A.x, 0, p), y: lerp(TILE_A.y, 0, p), w: lerp(TILE_A.w, 1080, p), h: lerp(TILE_A.h, 1920, p) };
  // inside the tile the video moves from the tile framing to the exact camera framing of the first shot
  // (tile framing is in tile coordinates; the camera framing is in screen coordinates)
  const camX = shotXf(SHOTS[0], Math.max(t, SHOTS[0].a));
  const tileX = andresTileXf();
  const ax: Xf = { s: lerp(tileX.s, camX.s, p), tx: lerp(tileX.tx, camX.tx - rect.x, p), ty: lerp(tileX.ty, camX.ty - rect.y, p) };
  const jOut = interpolate(t, [MORPH[0] - 0.05, MORPH[0] + 0.35], [0, 1], { ...clamp, easing: easeInOut });
  const bgOut = interpolate(t, [MORPH[0] + 0.25, MORPH[1]], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: NAVY, opacity: bgOut }}>
        <AbsoluteFill style={{ background: "radial-gradient(110% 60% at 0% 100%, rgba(6,114,216,0.25) 0%, rgba(8,23,34,0) 60%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - jOut, transform: `translateX(${-jOut * 520}px)` }}>
        <Tile rect={TILE_J} radius={24} active={sp === "juan"} ringOpacity={ringJ} label="Juan · Fluyenta">
          <Sequence durationInFrames={F(MORPH[1] + 0.1)} layout="none">
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: xfCss(juanXf()) }}>
              <Video file="juan_hi.mp4" outStart={0} />
            </div>
          </Sequence>
        </Tile>
      </div>
      <Tile rect={rect} radius={lerp(24, 0, p)} active={sp === "andres" || p > 0} ringOpacity={ringA * (1 - p)} label="Andrés Murcia · Fluyenta" labelOpacity={1 - p}>
        <Sequence durationInFrames={F(SPANS[1].out)} layout="none">
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: xfCss(ax) }}>
            <Video file="andres_hi.mp4" outStart={0} />
          </div>
        </Sequence>
        <Sequence from={F(SPANS[1].out)} durationInFrames={F(MORPH[1] + 0.1) - F(SPANS[1].out)} layout="none">
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: xfCss(ax) }}>
            <Video file="andres_hi.mp4" outStart={SPANS[1].out} />
          </div>
        </Sequence>
        <div style={{ position: "absolute", inset: 0, opacity: p }}>
          <div style={{ position: "absolute", left: -rect.x, top: -rect.y, width: 1080, height: 1920 }}>
            <Scrims />
          </div>
        </div>
      </Tile>
    </AbsoluteFill>
  );
};

// ---------- board: the real process designer (portal.runmyprocess.com) ----------
const BrowserWindow: React.FC<{ x: number; y: number; w: number; h: number; url: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, url, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h + 58, borderRadius: 18, overflow: "hidden", background: "#FFFFFF", boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)", ...style }}>
    <div style={{ height: 58, background: "#F2F5F8", borderBottom: "1px solid #E1E7ED", display: "flex", alignItems: "center", padding: "0 20px", position: "relative" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, marginRight: 9 }} />
      ))}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", height: 34, padding: "0 22px", borderRadius: 9, background: "#FFFFFF", border: "1px solid #E1E7ED", display: "flex", alignItems: "center", gap: 9, fontFamily: "Geist", fontSize: 20, color: MUTED, whiteSpace: "nowrap" }}>
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
          <rect x="1" y="6" width="10" height="7" rx="2" fill="#8C9CAC" />
          <path d="M3.5 6V4.5a2.5 2.5 0 015 0V6" stroke="#8C9CAC" strokeWidth="1.6" />
        </svg>
        {url}
      </div>
    </div>
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden" }}>{children}</div>
  </div>
);

const boardY = (t: number, a: number, b: number) => {
  const pin = interpolate(t, [a, a + PUSH], [1920, 0], { ...clamp, easing: easeInOut });
  const pout = interpolate(t, [b, b + PUSH], [0, -1920], { ...clamp, easing: easeInOut });
  return t < b ? pin : pout;
};
const BoardBg: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <AbsoluteFill style={{ background: "radial-gradient(100% 55% at 100% 0%, rgba(6,114,216,0.22) 0%, rgba(8,23,34,0) 60%), radial-gradient(90% 50% at 0% 100%, rgba(12,151,255,0.12) 0%, rgba(8,23,34,0) 60%)" }} />
  </AbsoluteFill>
);

const ProcessBoard: React.FC = () => {
  const t = useT();
  if (t < BOARD1[0] || t > BOARD1[1] + PUSH) return null;
  const y = boardY(t, BOARD1[0], BOARD1[1]);
  const win = spr(t, BOARD1[0] + 0.12, 14, 160);
  const zoom = interpolate(t, [BOARD1[0] + 0.2, BOARD1[1]], [1.1, 1.3], { ...clamp, easing: easeInOut });
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px)` }}>
      <BoardBg />
      <BrowserWindow
        x={L}
        y={540}
        w={W}
        h={525}
        url="portal.runmyprocess.com"
        style={{ opacity: interpolate(t, [BOARD1[0] + 0.12, BOARD1[0] + 0.3], [0, 1], clamp), transform: `translateY(${(1 - win) * 60}px) scale(${0.94 + 0.06 * win})` }}
      >
        <Sequence from={F(BOARD1[0])} durationInFrames={F(BOARD1[1] + PUSH) - F(BOARD1[0])} layout="none">
          {/* zoomed canvas of the real designer, pushing in toward the Decision gateway */}
          <div style={{ position: "absolute", inset: 0, transformOrigin: "52% 40%", transform: `scale(${zoom})` }}>
            <OffthreadVideo src={A("bpmn.mp4")} startFrom={F(0.6)} muted style={{ width: W, height: 525, objectFit: "cover" }} />
          </div>
        </Sequence>
      </BrowserWindow>
      <div style={{ position: "absolute", left: L, top: 1158, width: W, display: "flex", gap: 18 }}>
        {[
          { at: wordAt("sino para orquestar", "orquestar"), text: "Orquestar" },
          { at: lineAt("y para modelar"), text: "Modelar procesos de negocio" },
        ].map((c) => (
          <div key={c.text} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px 14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.16)", ...pop(t, c.at, 30) }}>
            <Mark ok />
            <span style={{ ...DISPLAY, fontWeight: 650, fontSize: 32, letterSpacing: "-0.03em", color: "#FFFFFF", whiteSpace: "nowrap" }}>{c.text}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- board: the full dataset into a BI ----------
const BiBoard: React.FC = () => {
  const t = useT();
  if (t < BI[0] || t > BI[1] + PUSH) return null;
  const y = boardY(t, BI[0], BI[1]);
  const w1 = spr(t, BI[0] + 0.15, 14, 160);
  const DS = lineAt("datasets completos");
  const w2 = spr(t, DS, 14, 160);
  const scroll = Math.max(0, t - (BI[0] + 0.2)) * 210; // rows stream up, fast
  const rowH = 30;
  const widths = [0.62, 0.48, 0.71, 0.55, 0.66, 0.42, 0.58, 0.69, 0.5, 0.63, 0.45, 0.6, 0.67, 0.52, 0.57, 0.64];
  const flow = interpolate(t, [DS + 0.1, DS + 0.55], [0, 1], clamp);
  const dash = (t * 140) % 40;
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px)` }}>
      <BoardBg />
      {/* window 1: every record */}
      <div
        style={{
          position: "absolute",
          left: L,
          top: 520,
          width: W,
          height: 330,
          borderRadius: 18,
          overflow: "hidden",
          background: "#FFFFFF",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          opacity: interpolate(t, [BI[0] + 0.15, BI[0] + 0.3], [0, 1], clamp),
          transform: `translateY(${(1 - w1) * 50}px) scale(${0.95 + 0.05 * w1})`,
        }}
      >
        <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", borderBottom: "1px solid #E3EAF0", fontFamily: "Geist" }}>
          <span style={{ fontWeight: 600, fontSize: 24, color: INK }}>Todos los registros</span>
          <span style={{ fontWeight: 500, fontSize: 21, color: MUTED }}>Dataset completo</span>
        </div>
        <div style={{ position: "relative", height: 276, overflow: "hidden" }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const yy = (((i * rowH - scroll) % (24 * rowH)) + 24 * rowH) % (24 * rowH) - rowH;
            const k = i % widths.length;
            return (
              <div key={i} style={{ position: "absolute", left: 26, right: 26, top: yy + 10, height: 14, display: "flex", gap: 18, alignItems: "center" }}>
                <div style={{ width: 16, height: 14, borderRadius: 3, background: "#8FA5BA" }} />
                <div style={{ width: `${widths[k] * 36}%`, height: 12, borderRadius: 6, background: "#D3DDE6" }} />
                <div style={{ width: `${(1 - widths[k]) * 30}%`, height: 12, borderRadius: 6, background: "#E1E8EE" }} />
                <div style={{ flex: 1 }} />
                <div style={{ width: 70, height: 12, borderRadius: 6, background: "#D3DDE6" }} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60, background: "linear-gradient(0deg, #FFFFFF, rgba(255,255,255,0))" }} />
        </div>
      </div>
      {/* the whole stack pours into the BI */}
      <svg width={1080} height={120} style={{ position: "absolute", left: 0, top: 850, opacity: flow }}>
        {[-120, -60, 0, 60, 120].map((dx, i) => (
          <line key={i} x1={540 + dx} y1={6} x2={540 + dx * 0.4} y2={108} stroke={AZURE} strokeWidth={3} strokeLinecap="round" strokeDasharray="14 26" strokeDashoffset={-dash} opacity={0.9} />
        ))}
      </svg>
      {/* window 2: the BI */}
      <div
        style={{
          position: "absolute",
          left: L,
          top: 970,
          width: W,
          height: 210,
          borderRadius: 18,
          overflow: "hidden",
          background: "#FFFFFF",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          opacity: interpolate(t, [DS, DS + 0.15], [0, 1], clamp),
          transform: `translateY(${(1 - w2) * 50}px) scale(${0.95 + 0.05 * w2})`,
        }}
      >
        <div style={{ position: "absolute", left: 26, top: 22, ...DISPLAY, fontSize: 44, color: INK }}>BI</div>
        <div style={{ position: "absolute", left: 120, right: 30, bottom: 28, height: 140, display: "flex", alignItems: "flex-end", gap: 14 }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const h = 0.35 + 0.6 * Math.abs(Math.sin(i * 1.7 + t * 3.1 + Math.sin(i)));
            return <div key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: 5, background: i % 3 === 0 ? BLUE : "#C9D5DF" }} />;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- photo tiles -> full-bleed photos ----------
const PHOTOS = [
  { at: PHOTO_IN, file: "photos/bodycam.png", word: "Bodycams.", pos: "2% 50%", scale: 1, origin: "50% 50%" },
  { at: lineAt("como drones"), file: "photos/drone.png", word: "Drones.", pos: "50% 50%", scale: 1, origin: "50% 50%" },
  { at: lineAt("como sensores"), file: "photos/sensor.png", word: "Sensores.", pos: "50% 50%", scale: 1.1, origin: "50% 100%" },
];
const TILE_W = 260;
const TILE_H = 420;
const tileRect = (i: number) => ({ x: L + i * (TILE_W + 30), y: CARD_TOP, w: TILE_W, h: TILE_H });

const PhotoTiles: React.FC = () => {
  const t = useT();
  if (t < TILES_AT || t > PHOTO_IN + 0.5) return null;
  return (
    <>
      {PHOTOS.map((p, i) => {
        if (i === 0 && t >= PHOTO_IN) return null; // the first tile becomes the full-bleed photo
        const r = tileRect(i);
        const e = pop(t, TILES_AT + i * 0.1, 60);
        const gone = i === 0 ? 0 : interpolate(t, [PHOTO_IN, PHOTO_IN + 0.2], [0, 1], clamp);
        return (
          <div key={p.file} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", ...e, opacity: e.opacity * (1 - gone) }}>
            <Img src={A(p.file)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 18px 16px", background: "linear-gradient(0deg, rgba(3,21,38,0.85), rgba(3,21,38,0))", color: "#FFFFFF", fontFamily: "Schibsted", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>
              {p.word.replace(".", "")}
            </div>
          </div>
        );
      })}
    </>
  );
};

const PhotoSlides: React.FC = () => {
  const t = useT();
  if (t < PHOTO_IN || t > PHOTO_OUT + PUSH) return null;
  const idx = PHOTOS.reduce((k, p, i) => (t >= p.at ? i : k), 0);
  // the bodycam tile opens to full frame
  const ex = interpolate(t, [PHOTO_IN, PHOTO_IN + 0.42], [0, 1], { ...clamp, easing: easeInOut });
  const r0 = tileRect(0);
  const rect = idx === 0 ? { x: lerp(r0.x, 0, ex), y: lerp(r0.y, 0, ex), w: lerp(r0.w, 1080, ex), h: lerp(r0.h, 1920, ex), r: lerp(20, 0, ex) } : { x: 0, y: 0, w: 1080, h: 1920, r: 0 };
  const out = interpolate(t, [PHOTO_OUT, PHOTO_OUT + PUSH], [0, -1920], { ...clamp, easing: easeInOut });
  const p = PHOTOS[idx];
  const end = idx + 1 < PHOTOS.length ? PHOTOS[idx + 1].at : PHOTO_OUT + PUSH;
  const kb = interpolate(t, [p.at, end], [1.0, 1.06], clamp);
  const settle = idx === 0 ? 1 : 1 + 0.08 * (1 - spr(t, p.at, 18, 220));
  const textIn = idx === 0 ? ex : 1;
  return (
    <AbsoluteFill style={{ transform: `translateY(${out}px)` }}>
      <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: rect.r, overflow: "hidden", backgroundColor: NAVY }}>
        <div style={{ position: "absolute", left: (rect.w - 1080) / 2, top: (rect.h - 1920) / 2, width: 1080, height: 1920 }}>
          <Img src={A(p.file)} style={{ width: 1080, height: 1920, objectFit: "cover", objectPosition: p.pos, transformOrigin: p.origin, transform: `scale(${p.scale * kb * settle})` }} />
        </div>
        <div style={{ position: "absolute", left: -rect.x, top: -rect.y, width: 1080, height: 1920, opacity: textIn }}>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,21,38,0.55) 0px, rgba(3,21,38,0.0) 330px)" }} />
          <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(3,21,38,0.94) 0px, rgba(3,21,38,0.82) 560px, rgba(3,21,38,0.0) 980px)" }} />
          <div style={{ position: "absolute", left: L, top: 1150, width: W }}>
            <div style={{ fontFamily: "Geist", fontWeight: 550, fontSize: 30, color: PALE, marginBottom: 14 }}>Periféricos conectados</div>
            {PHOTOS.map((q, i) => {
              const on = t >= q.at;
              return (
                <div key={q.word} style={{ ...DISPLAY, fontSize: 108, lineHeight: 1.04, color: i === idx ? AZURE : "rgba(255,255,255,0.55)", textShadow: SHADOW_TXT, whiteSpace: "nowrap", ...(on ? pop(t, q.at, 40) : { opacity: 0 }) }}>
                  {q.word}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- headlines ----------
type Head = { a: number; b: number; l1: string; l2: string; l2At?: number };
const HEADS: Head[] = [
  { a: 0, b: NUM_AT - 0.18, l1: "¿Cuántos tokens", l2: "gasta tu IA?" },
  { a: IA_LINE, b: BOARD1[1], l1: "La IA no ejecuta.", l2: "Orquesta.", l2At: wordAt("sino para orquestar", "orquestar") },
  { a: SPANS[3].out + 0.08, b: PHOTO_IN, l1: "Del campo", l2: "al proceso." },
  { a: BI[0] + 0.1, b: BI[1], l1: "¿Todo el dataset", l2: "a un BI?", l2At: lineAt("a un BI") },
  { a: BI[1] + 0.1, b: THEN_AT, l1: "La lógica decide", l2: "qué datos ve la IA." },
  { a: THEN_AT + 0.19, b: VISTO_AT, l1: "Un pipeline", l2: "completo.", l2At: wordAt("un pipeline", "completo") },
];
const Headline: React.FC = () => {
  const t = useT();
  const h = HEADS.find((x) => t >= x.a && t < x.b);
  if (!h) return null;
  const first = h.a === 0;
  const l1 = first ? { opacity: 1, transform: "none" } : pop(t, h.a, 36);
  const l2 = first ? { opacity: 1, transform: "none" } : pop(t, h.l2At ?? h.a + 0.1, 36);
  const exit = fadeOut(t, h.b - 0.22);
  const line: React.CSSProperties = { ...DISPLAY, fontSize: HEAD_SIZE, lineHeight: 1.04, whiteSpace: "nowrap", textShadow: SHADOW_TXT };
  return (
    <div style={{ position: "absolute", left: L, top: HEAD_TOP, width: W }}>
      <div style={{ ...line, color: "#FFFFFF", ...merge(l1, exit) }}>{h.l1}</div>
      <div style={{ ...line, color: BLUE, ...merge(l2, exit) }}>{h.l2}</div>
    </div>
  );
};

// ---------- captions: word by word, on the seam (camera), in the speaking tile (split), under the boards ----------
const inPush = (t: number) =>
  [BOARD1[0], BOARD1[1], BI[0], BI[1]].some((x) => t >= x && t < x + PUSH + 0.02);
const captionTop = (t: number, c: Cap): number | null => {
  if ((t >= PHOTO_IN && t < PHOTO_OUT + PUSH) || t >= END_AT || inPush(t)) return null;
  return CAP_TOP;
};
const CaptionLine: React.FC<{ c: Cap; top: number }> = ({ c, top }) => {
  const t = useT();
  const base = c.who === "juan" ? FOOT : "#FFFFFF";
  return (
    <div style={{ position: "absolute", left: L, top, width: W, height: 60, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: "Schibsted", fontWeight: 650, fontSize: 46, letterSpacing: "-0.02em", lineHeight: "60px", whiteSpace: "nowrap", textShadow: HALO }}>
        {c.words.map((w, i) => {
          const p = interpolate(t, [w.s - 0.04, w.s + 0.1], [0, 1], { ...clamp, easing: easeOut });
          return (
            <span key={i} style={{ display: "inline-block", color: w.accent ? AZURE : base, opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
              {w.w}
              {i < c.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
const Captions: React.FC = () => {
  const t = useT();
  const c = CAPTIONS.find((x) => t >= x.s - 0.04 && t < x.hold);
  if (!c) return null;
  const top = captionTop(t, c);
  return top === null ? null : <CaptionLine key={c.s} c={c} top={top} />;
};

// ---------- cards ----------
const Card: React.FC<{ a: number; b: number; children: React.ReactNode; height?: number }> = ({ a, b, children, height }) => {
  const t = useT();
  if (t < a || t > b + 0.35) return null;
  const st = merge(pop(t, a, 70), fadeOut(t, b, 0.26, 24));
  return (
    <div
      style={{
        position: "absolute",
        left: L,
        top: CARD_TOP,
        width: W,
        height,
        background: "#FFFFFF",
        borderRadius: 24,
        boxShadow: "0 25px 70px rgba(6,24,39,0.30), 0 6px 18px rgba(6,24,39,0.18)",
        padding: "32px 38px",
        boxSizing: "border-box",
        color: INK,
        fontFamily: "Geist",
        ...st,
      }}
    >
      {children}
    </div>
  );
};
const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontFamily: "Geist", fontWeight: 500, fontSize: 25, color: MUTED }}>{children}</div>;

const TokenCard: React.FC<{ a: number; b: number; fillAt: number; shrinkAt: number }> = ({ a, b, fillAt, shrinkAt }) => {
  const t = useT();
  const full = interpolate(t, [fillAt, fillAt + 0.5], [0, 100], { ...clamp, easing: easeOut });
  const pct = interpolate(t, [shrinkAt, shrinkAt + 0.5], [0, 5], { ...clamp, easing: easeOut });
  const band = interpolate(t, [shrinkAt + 0.4, shrinkAt + 0.75], [0, 1], clamp);
  const label: React.CSSProperties = { width: 214, fontSize: 27, fontWeight: 550, color: INK, whiteSpace: "nowrap" };
  const track: React.CSSProperties = { position: "relative", flex: 1, height: 22, borderRadius: 6, overflow: "hidden" };
  return (
    <Card a={a} b={b}>
      <Eyebrow>Consumo de tokens</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 26 }}>
        <div style={label}>Uso habitual</div>
        <div style={{ ...track, background: "#DCE5ED" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${full}%`, background: "#8FA5BA" }} />
        </div>
        <div style={{ ...DISPLAY, width: 150, textAlign: "right", fontSize: 36, color: INK }}>100%</div>
      </div>
      <div style={{ height: 1, background: "#E3EAF0", margin: "24px 0" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={label}>Con Fluyenta</div>
        <div style={{ ...track, background: "#E9F1FF" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: BLUE }} />
          <div style={{ position: "absolute", left: "5%", top: 0, bottom: 0, width: "5%", background: BLUE, opacity: 0.35 * band }} />
        </div>
        <div style={{ ...DISPLAY, width: 150, textAlign: "right", fontSize: 50, color: BLUE, whiteSpace: "nowrap", ...pop(t, shrinkAt + 0.35, 14) }}>5–10%</div>
      </div>
    </Card>
  );
};

const Mark: React.FC<{ ok: boolean }> = ({ ok }) => (
  <div style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: ok ? BLUE : "transparent", border: ok ? "none" : "2.5px solid #A9B7C4", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={ok ? "#FFFFFF" : "#8C9CAC"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {ok ? <path d="M4.5 11.5l4.2 4.2L17.5 6.5" /> : <path d="M6 6l10 10M16 6L6 16" />}
    </svg>
  </div>
);
const RoleCard: React.FC = () => {
  const t = useT();
  const SINO = lineAt("sino para orquestar");
  const strike = interpolate(t, [SINO - 0.15, SINO + 0.15], [0, 1], { ...clamp, easing: easeInOut });
  const txt: React.CSSProperties = { ...DISPLAY, fontWeight: 650, fontSize: 40, letterSpacing: "-0.03em", whiteSpace: "nowrap" };
  return (
    <Card a={lineAt("ejecutar acciones") + 0.05} b={BOARD1[0] + 0.03}>
      <Eyebrow>El papel de la IA</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 22, height: 74, marginTop: 16 }}>
        <Mark ok={false} />
        <div style={{ position: "relative" }}>
          <span style={{ ...txt, color: MUTED }}>Ejecutar acciones</span>
          <div style={{ position: "absolute", left: -4, top: "54%", height: 3, width: `calc(${strike * 100}% + 8px)`, background: MUTED, borderRadius: 2 }} />
        </div>
      </div>
    </Card>
  );
};

// rows stream into a BPMN gateway; only what the logic selects continues to the AI
const DataCard: React.FC = () => {
  const t = useT();
  const SW = 764;
  const ROWS = 8;
  const rowY = (i: number) => 54 + i * 38;
  const rowW = [214, 168, 196, 150, 206, 176, 190, 160];
  const picked = [1, 4, 6];
  const midY = rowY(0) + ((ROWS - 1) * 38) / 2;
  const box = { x: 594, y: midY - 56, w: 170, h: 112 };
  const dia = { cx: 388, cy: midY, r: 58 };
  const C0 = BI[1] + 0.2;
  const DIA = lineAt("análisis muy grandes");
  const AI = lineAt("con inteligencia");
  const PICK = lineAt("basado en esa");
  const rowsIn = (i: number) => interpolate(t, [C0 + 0.05 + i * 0.05, C0 + 0.35 + i * 0.05], [0, 1], clamp);
  const diaIn = spr(t, DIA, 12, 170);
  const aiIn = spr(t, AI, 12, 170);
  const pick = interpolate(t, [PICK, PICK + 0.42], [0, 1], { ...clamp, easing: easeInOut });
  const lines = interpolate(t, [DIA + 0.15, DIA + 0.65], [0, 1], { ...clamp, easing: easeInOut });
  const flowOn = t >= PICK + 0.12;
  return (
    <Card a={C0} b={THEN_AT - 0.1}>
      <svg width={SW} height={350} viewBox={`0 0 ${SW} 350`} style={{ display: "block", overflow: "visible" }}>
        <text x={0} y={22} fontFamily="Geist" fontWeight={500} fontSize={25} fill={MUTED}>
          Datos
        </text>
        {Array.from({ length: ROWS }).map((_, i) => {
          const sel = picked.includes(i);
          const dim = pick * (sel ? 0 : 1);
          const on = sel && pick > 0.5;
          const shimmer = 0.75 + 0.25 * Math.sin(t * 6 + i * 0.9); // keeps the stack alive before the logic picks
          return (
            <g key={i} opacity={rowsIn(i) * (1 - 0.72 * dim) * (pick > 0 ? 1 : shimmer)}>
              <rect x={0} y={rowY(i) - 7} width={18} height={14} rx={3} fill={on ? BLUE : "#8FA5BA"} />
              <rect x={28} y={rowY(i) - 7} width={rowW[i]} height={14} rx={7} fill={on ? "#BFD6F6" : "#D3DDE6"} />
            </g>
          );
        })}
        {Array.from({ length: ROWS }).map((_, i) => {
          const sel = picked.includes(i);
          const x1 = 28 + rowW[i] + 10;
          const y1 = rowY(i);
          const x2 = dia.cx - dia.r - 4;
          const len = Math.hypot(x2 - x1, dia.cy - y1);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={dia.cy}
              stroke={sel && pick > 0.5 ? BLUE : "#B4C3D0"}
              strokeWidth={sel && pick > 0.5 ? 2.5 : 1.6}
              strokeDasharray={len}
              strokeDashoffset={len * (1 - lines)}
              opacity={sel ? 1 : 1 - 0.85 * pick}
            />
          );
        })}
        {/* dots travelling along the picked paths and on to the AI */}
        {flowOn &&
          picked.flatMap((i, k) => {
            const x1 = 28 + rowW[i] + 10;
            const y1 = rowY(i);
            const x2 = dia.cx - dia.r;
            return [0, 0.5].map((off) => {
              const ph = ((t - PICK - 0.12) * 0.9 + off + k * 0.17) % 1;
              const leg1 = Math.min(1, ph * 2);
              const leg2 = Math.max(0, ph * 2 - 1);
              const cx = ph < 0.5 ? lerp(x1, x2, leg1) : lerp(dia.cx + dia.r, box.x, leg2);
              const cy = ph < 0.5 ? lerp(y1, dia.cy, leg1) : dia.cy;
              return <circle key={`${i}-${off}`} cx={cx} cy={cy} r={5.5} fill={BLUE} />;
            });
          })}
        <g opacity={interpolate(t, [DIA, DIA + 0.1], [0, 1], clamp)} transform={`translate(${dia.cx} ${dia.cy}) scale(${0.6 + 0.4 * diaIn}) translate(${-dia.cx} ${-dia.cy})`}>
          <path d={`M${dia.cx} ${dia.cy - dia.r} L${dia.cx + dia.r} ${dia.cy} L${dia.cx} ${dia.cy + dia.r} L${dia.cx - dia.r} ${dia.cy} Z`} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          <path d={`M${dia.cx - 16} ${dia.cy - 16} L${dia.cx + 16} ${dia.cy + 16} M${dia.cx + 16} ${dia.cy - 16} L${dia.cx - 16} ${dia.cy + 16}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <text x={dia.cx} y={dia.cy + dia.r + 40} textAnchor="middle" fontFamily="Geist" fontWeight={550} fontSize={23} fill={INK}>
            Lógica de negocio
          </text>
        </g>
        <line x1={dia.cx + dia.r + 4} y1={dia.cy} x2={box.x - 4} y2={dia.cy} stroke={BLUE} strokeWidth={2.5} opacity={interpolate(t, [PICK, PICK + 0.3], [0, 1], clamp)} />
        <g opacity={interpolate(t, [AI, AI + 0.12], [0, 1], clamp)} transform={`translate(${box.x + box.w / 2} ${box.y + box.h / 2}) scale(${0.6 + 0.4 * aiIn}) translate(${-(box.x + box.w / 2)} ${-(box.y + box.h / 2)})`}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={14} fill={BLUE} />
          <text x={box.x + box.w / 2} y={box.y + 72} textAnchor="middle" fontFamily="Schibsted" fontWeight={750} fontSize={46} letterSpacing="-1.5" fill="#FFFFFF">
            IA
          </text>
        </g>
      </svg>
    </Card>
  );
};

const PipelineCard: React.FC = () => {
  const t = useT();
  const steps = [
    { at: THEN_AT + 0.33, title: "Periféricos", sub: "bodycams, drones, sensores" },
    { at: THEN_AT + 0.8, title: "Lógica de negocio", sub: "" },
    { at: THEN_AT + 1.3, title: "IA", sub: "" },
  ];
  return (
    <Card a={THEN_AT + 0.19} b={VISTO_AT - 0.1}>
      <Eyebrow>Pipeline</Eyebrow>
      <div style={{ display: "flex", alignItems: "stretch", marginTop: 22 }}>
        {steps.map((s, i) => {
          const e = pop(t, s.at, 30);
          const last = i === steps.length - 1;
          return (
            <React.Fragment key={s.title}>
              {i > 0 && (
                <div style={{ width: 64, position: "relative", opacity: e.opacity }}>
                  <svg width="64" height="150" viewBox="0 0 64 150" style={{ position: "absolute", inset: 0 }}>
                    <line x1="6" y1="75" x2="52" y2="75" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M46 68l8 7-8 7" stroke={BLUE} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    {t > s.at && <circle cx={6 + (((t - s.at) * 1.6) % 1) * 44} cy="75" r="5" fill={AZURE} />}
                  </svg>
                </div>
              )}
              <div
                style={{
                  width: 212,
                  height: 150,
                  borderRadius: 14,
                  boxSizing: "border-box",
                  padding: "0 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  background: last ? BLUE : "#F2F6F9",
                  border: last ? "none" : "2px solid #C9D5DF",
                  ...e,
                }}
              >
                <div style={{ ...DISPLAY, fontWeight: 700, fontSize: last ? 44 : 31, lineHeight: 1.08, letterSpacing: "-0.03em", color: last ? "#FFFFFF" : INK }}>{s.title}</div>
                {s.sub && <div style={{ fontFamily: "Geist", fontWeight: 500, fontSize: 19, lineHeight: 1.3, color: MUTED, marginTop: 8 }}>{s.sub}</div>}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
};

// ---------- closing card ----------
const EndCard: React.FC = () => {
  const t = useT();
  if (t < END_AT) return null;
  const p = interpolate(t, [END_AT, END_AT + 0.45], [0, 1], { ...clamp, easing: easeInOut });
  const line: React.CSSProperties = { ...DISPLAY, fontSize: 112, lineHeight: 1.0, letterSpacing: "-5px", whiteSpace: "nowrap" };
  const shine = interpolate(t, [END_AT + 1.4, END_AT + 2.2], [-40, 140], clamp);
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - p) * 1920}px)`, backgroundColor: NAVY }}>
      <AbsoluteFill style={{ background: "radial-gradient(120% 70% at 0% 100%, rgba(6,114,216,0.26) 0%, rgba(8,23,34,0) 60%)" }} />
      <div style={{ position: "absolute", left: L, top: 520, width: W }}>
        <div style={{ ...line, color: "#FFFFFF", ...pop(t, END_AT + 0.3, 50) }}>Empieza con</div>
        <div style={{ ...line, color: BLUE, ...pop(t, END_AT + 0.42, 50) }}>un proceso.</div>
        <div style={{ fontFamily: "Geist", fontSize: 36, lineHeight: 1.38, color: FOOT, marginTop: 40, ...rise(t, END_AT + 0.65, 0.4, 20) }}>
          Muéstranos el proceso que
          <br />
          tu equipo quiere mejorar.
        </div>
        <div style={{ display: "flex", marginTop: 56, ...pop(t, END_AT + 0.85, 30) }}>
          <div style={{ position: "relative", overflow: "hidden", background: BLUE, color: "#FFFFFF", fontFamily: "Geist", fontWeight: 600, fontSize: 31, padding: "0 32px", height: 86, display: "flex", alignItems: "center", whiteSpace: "nowrap", borderRadius: "10px 0 0 10px" }}>
            Agenda una consulta →
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: "30%", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.28), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
          </div>
          <div style={{ border: "2px solid rgba(255,255,255,0.55)", borderLeft: "none", color: "#FFFFFF", fontFamily: "Geist", fontWeight: 500, fontSize: 31, padding: "0 30px", height: 86, boxSizing: "border-box", display: "flex", alignItems: "center", whiteSpace: "nowrap", borderRadius: "0 10px 10px 0" }}>
            fluyenta.com
          </div>
        </div>
        <Img src={A(LOGO)} style={{ display: "block", width: 560, marginTop: 110, ...pop(t, END_AT + 1.05, 24) }} />
      </div>
    </AbsoluteFill>
  );
};

// Fluyenta, powered by RunMyProcess (the new lockup, extracted from the team's announcement graphic)
const LOGO = "logo2/fluyenta-rmp-white.png";
const Logo: React.FC = () => {
  const t = useT();
  return <Img src={A(LOGO)} style={{ position: "absolute", left: L, top: 180, width: 330, opacity: interpolate(t, [END_AT + 0.1, END_AT + 0.4], [1, 0], clamp) }} />;
};

// ---------- assembly ----------
export const FluyentaInterview: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <Audio src={A("master.wav")} />
    <AbsoluteFill>
      {SHOTS.map((s) => (
        <Sequence key={s.a} from={F(s.a)} durationInFrames={F(s.b) - F(s.a)}>
          <CameraShot shot={s} />
        </Sequence>
      ))}
    </AbsoluteFill>
    <Opening />
    <TokenCard a={NUM_AT + 0.62} b={IA_LINE - 0.25} fillAt={NUM_AT + 0.72} shrinkAt={NUM_AT + 1.12} />
    <RoleCard />
    <DataCard />
    <PipelineCard />
    <TokenCard a={TOK_AT + 0.28} b={TOTAL} fillAt={TOK_AT + 0.38} shrinkAt={TOK_AT + 0.83} />
    <PhotoTiles />
    <ProcessBoard />
    <PhotoSlides />
    <BiBoard />
    <Headline />
    <Captions />
    <EndCard />
    <Logo />
  </AbsoluteFill>
);
