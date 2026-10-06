"""Every path the pipeline touches, in one place.

Raw camera files are NOT in git (1.4 GB each). Point FLUYENTA_SRC at the folder that holds them:
  andres-view.mp4       Andrés' camera (its audio track is silent)
  juan-view-audio.mp4   Juan's camera, carries the interview audio
Default: ~/Downloads (where the team delivered them on 2026-10-05).
"""
import os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.expanduser(os.environ.get("FLUYENTA_SRC", "~/Downloads"))
ANDRES_RAW = os.path.join(SRC_DIR, "andres-view.mp4")
JUAN_RAW = os.path.join(SRC_DIR, "juan-view-audio.mp4")

PIPE = os.path.join(REPO, "pipeline")
WORK = os.path.join(PIPE, "work")          # scratch, gitignored
DATA = os.path.join(PIPE, "data")          # transcript.json (written by transcribe.py)
PUBLIC = os.path.join(REPO, "public", "fluyenta-interview")
EDL_TS = os.path.join(REPO, "src", "fluyenta-interview", "edl.ts")

os.makedirs(WORK, exist_ok=True)
os.makedirs(DATA, exist_ok=True)
