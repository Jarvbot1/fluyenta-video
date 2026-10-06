// node scripts/thumbs.mjs -> out/thumb-9x16.png, out/thumb-16x9.png
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
fs.mkdirSync("out", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
try {
  for (const [id, out] of [["FluyentaInterviewThumb916", "out/thumb-9x16.png"], ["FluyentaInterviewThumb169", "out/thumb-16x9.png"]]) {
    const c = await selectComposition({ serveUrl, id });
    await renderStill({ serveUrl, composition: c, frame: 0, output: out, imageFormat: "png" });
    console.log("wrote", out);
  }
} finally {
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
