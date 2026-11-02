#!/usr/bin/env python3
"""Build aligned transparent cutouts from manually traced hero polygons.

Input: annotations/<hero>-rig-annotations.json exported by tools/rig-annotator.
Each part is extracted from the original PNG with its own polygon mask. Output
images remain on the original 1024x1024 canvas so pivots and layering align.
This does not invent hidden anatomy; occlusion reconstruction is a separate gate.
"""
from pathlib import Path
import argparse, json
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
HEROES = {"warden", "ranger", "arcanist", "reaper"}

def build(path: Path, out_root: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    hero = data.get("hero")
    if hero not in HEROES:
        raise ValueError(f"Unsupported hero: {hero}")
    src = ROOT / f"assets/characters/heroes/{hero}.png"
    if not src.is_file():
        raise FileNotFoundError(src)
    image = Image.open(src).convert("RGBA")
    width, height = image.size
    if (width, height) != (1024, 1024):
        raise ValueError(f"{hero}: expected 1024x1024, got {width}x{height}")
    output = out_root / hero
    output.mkdir(parents=True, exist_ok=True)
    report = {"schema_version": 1, "hero": hero, "source": str(src.relative_to(ROOT)),
              "canvas": {"width": width, "height": height}, "parts": [], "joints": data.get("joints", {}), "status": "manual-polygons-extracted-awaiting-occlusion-and-visual-qa"}
    for part, spec in sorted(data.get("parts", {}).items()):
        polygons = spec.get("polygons", [])
        valid = [poly for poly in polygons if isinstance(poly, list) and len(poly) >= 3]
        if not valid:
            continue
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)
        for poly in valid:
            points = [(max(0, min(width-1, int(p[0]))), max(0, min(height-1, int(p[1])))) for p in poly]
            draw.polygon(points, fill=255)
        alpha = np.asarray(image.getchannel("A"), dtype=np.uint16)
        cut = image.copy()
        cut_alpha = (alpha * np.asarray(mask, dtype=np.uint16) // 255).astype(np.uint8)
        cut.putalpha(Image.fromarray(cut_alpha, "L"))
        # Keep the full source canvas: all parts share exactly the same origin.
        filename = f"{part.replace('/', '-')}.png"
        cut.save(output / filename, optimize=True)
        ys, xs = np.where(cut_alpha > 8)
        bbox = [int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)] if len(xs) else [0,0,0,0]
        report["parts"].append({"id": part, "file": filename, "polygons": len(valid),
                                "pixels": int((cut_alpha > 8).sum()), "bbox": bbox,
                                "canvas_aligned": True})
    report["joint_count"] = len(joints)\n    report["missing_core_joints"] = [name for name in ("pelvis", "neck", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist", "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle") if name not in joints]\n    report["status"] = "no-parts" if not report["parts"] else report["status"]
    (output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    return report

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--annotations", required=True, type=Path)
    parser.add_argument("--out", type=Path, default=ROOT / "assets/characters/rig-parts/manual")
    args = parser.parse_args()
    report = build(args.annotations, args.out)
    print(f"{report['hero']}: exported {len(report['parts'])} canvas-aligned transparent parts")
    print(f"status: {report['status']}")

if __name__ == "__main__":
    main()
