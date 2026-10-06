#!/usr/bin/env bash
# Camera proxies Remotion reads: 1620x2880 (1.5x headroom for the 1.2x punch-ins), clip-03 range only.
# Both start at source 140 s, so proxy time t = source 140 + t (frame-exact, verified 2026-10-05).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
src="${FLUYENTA_SRC:-$HOME/Downloads}"
out="$here/../public/fluyenta-interview"
mkdir -p "$out"
for n in andres juan; do
  f="$src/andres-view.mp4"; [ "$n" = juan ] && f="$src/juan-view-audio.mp4"
  ffmpeg -v error -y -ss 140 -i "$f" -t 76 -map 0:v:0 -vf scale=1620:2880:flags=lanczos \
    -c:v h264_videotoolbox -b:v 32M -profile:v high -g 24 -an -movflags +faststart "$out/${n}_hi.mp4" &
done
wait
ls -la "$out"/*_hi.mp4
