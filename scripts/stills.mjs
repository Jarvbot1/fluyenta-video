// node scripts/stills.mjs <CompositionId> <seconds...>  -> out/stills/s_<sec>.png
// Bundles once, renders every still, then deletes the bundle: Remotion copies all of public/ into
// $TMPDIR on every bundle and never cleans up (that filled the disk once).
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [comp, ...secs] = process.argv.slice(2);
fs.mkdirSync("out/stills", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
try {
  const c = await selectComposition({ serveUrl, id: comp });
  for (const s of secs.map(Number)) {
    const frame = Math.min(c.durationInFrames - 1, Math.round(s * 30));
    const out = `out/stills/s_${String(s).replace(".", "_")}.png`;
    await renderStill({ serveUrl, composition: c, frame, output: out, imageFormat: "png" });
    console.log("wrote", out);
  }
} finally {
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
