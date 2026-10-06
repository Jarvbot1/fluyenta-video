import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

// Covers for the interview clip: 9:16 (Reels / Shorts) and 16:9 (YouTube / LinkedIn).
// Same system as the video: Schibsted 750 + Geist, #0672D8 emphasis, white token card, real logo.
const A = (p: string) => staticFile(`fluyenta-interview/${p}`);
loadFont({ family: "Schibsted", url: A("fonts/schibsted-grotesk-latin.woff2"), weight: "100 900" });
loadFont({ family: "Geist", url: A("fonts/geist-latin.woff2"), weight: "100 900" });

const NAVY = "#081722";
const INK = "#09243C";
const MUTED = "#536779";
const BLUE = "#0672D8";
const DISPLAY: React.CSSProperties = { fontFamily: "Schibsted", fontWeight: 750, letterSpacing: "-0.043em", whiteSpace: "nowrap" };
const SHADOW = "0 3px 10px rgba(2,14,26,0.45)";

const TokenCardStatic: React.FC<{ width: number; scale?: number }> = ({ width, scale = 1 }) => {
  const label: React.CSSProperties = { width: 214 * scale, fontSize: 27 * scale, fontWeight: 550, color: INK, whiteSpace: "nowrap" };
  const track: React.CSSProperties = { position: "relative", flex: 1, height: 22 * scale, borderRadius: 6 * scale, overflow: "hidden" };
  return (
    <div
      style={{
        width,
        background: "#FFFFFF",
        borderRadius: 24 * scale,
        boxShadow: "0 25px 70px rgba(6,24,39,0.30), 0 6px 18px rgba(6,24,39,0.18)",
        padding: `${32 * scale}px ${38 * scale}px`,
        boxSizing: "border-box",
        fontFamily: "Geist",
        color: INK,
      }}
    >
      <div style={{ fontWeight: 500, fontSize: 25 * scale, color: MUTED }}>Consumo de tokens</div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 * scale, marginTop: 26 * scale }}>
        <div style={label}>Uso habitual</div>
        <div style={{ ...track, background: "#DCE5ED" }}>
          <div style={{ position: "absolute", inset: 0, background: "#8FA5BA" }} />
        </div>
        <div style={{ ...DISPLAY, width: 150 * scale, textAlign: "right", fontSize: 36 * scale, color: INK }}>100%</div>
      </div>
      <div style={{ height: 1, background: "#E3EAF0", margin: `${24 * scale}px 0` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 22 * scale }}>
        <div style={label}>Con Fluyenta</div>
        <div style={{ ...track, background: "#E9F1FF" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "5%", background: BLUE }} />
          <div style={{ position: "absolute", left: "5%", top: 0, bottom: 0, width: "5%", background: BLUE, opacity: 0.35 }} />
        </div>
        <div style={{ ...DISPLAY, width: 150 * scale, textAlign: "right", fontSize: 50 * scale, color: BLUE }}>5–10%</div>
      </div>
    </div>
  );
};

// face centre in the 1080x1920 frame space of the source still
const FACE = { x: 465, y: 742 };

export const FluyentaInterviewThumb916: React.FC = () => {
  const s = 1.3;
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, overflow: "hidden" }}>
      <Img
        src={A("thumbs/andres-frame.png")}
        style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${540 - s * FACE.x}px, ${800 - s * FACE.y}px) scale(${s})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,21,38,0.9) 0px, rgba(3,21,38,0.76) 420px, rgba(3,21,38,0.25) 600px, rgba(3,21,38,0) 720px)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(3,21,38,0.7) 0px, rgba(3,21,38,0) 520px)" }} />
      <Img src={A("logo2/fluyenta-rmp-white.png")} style={{ position: "absolute", left: 120, top: 180, width: 330 }} />
      <div style={{ position: "absolute", left: 120, top: 292 }}>
        <div style={{ ...DISPLAY, fontSize: 100, lineHeight: 1.02, color: "#FFFFFF", textShadow: SHADOW }}>¿Cuántos tokens</div>
        <div style={{ ...DISPLAY, fontSize: 100, lineHeight: 1.02, color: BLUE, textShadow: SHADOW }}>gasta tu IA?</div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 1130 }}>
        <TokenCardStatic width={840} />
      </div>
    </AbsoluteFill>
  );
};

export const FluyentaInterviewThumb169: React.FC = () => {
  const s = 1.15;
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, overflow: "hidden" }}>
      {/* Andrés on the right half */}
      <Img
        src={A("thumbs/andres-frame.png")}
        style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${1430 - s * FACE.x}px, ${470 - s * FACE.y}px) scale(${s})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,23,34,1) 0px, rgba(8,23,34,1) 930px, rgba(8,23,34,0.6) 1060px, rgba(8,23,34,0) 1250px)" }} />
      <Img src={A("logo2/fluyenta-rmp-white.png")} style={{ position: "absolute", left: 120, top: 96, width: 340 }} />
      <div style={{ position: "absolute", left: 120, top: 230 }}>
        <div style={{ ...DISPLAY, fontSize: 104, lineHeight: 1.02, color: "#FFFFFF" }}>¿Cuántos tokens</div>
        <div style={{ ...DISPLAY, fontSize: 104, lineHeight: 1.02, color: BLUE }}>gasta tu IA?</div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 540 }}>
        <TokenCardStatic width={760} scale={0.9} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 905, fontFamily: "Geist", fontWeight: 500, fontSize: 30, color: "#B7D9FA" }}>
        Andrés Murcia · Fluyenta
      </div>
    </AbsoluteFill>
  );
};
