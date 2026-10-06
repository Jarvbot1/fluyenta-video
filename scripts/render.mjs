// node scripts/render.mjs <CompositionId> <output.mp4>
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [comp, output] = process.argv.slice(2);
fs.mkdirSync(path.dirname(output), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
try {
  const c = await selectComposition({ serveUrl, id: comp });
  let last = -1;
  await renderMedia({
    serveUrl, composition: c, codec: "h264", crf: 16, audioCodec: "aac", audioBitrate: "320k", outputLocation: output, concurrency: 6,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`progress ${p * 10}%`); } },
  });
  console.log("done", output);
} finally {
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
