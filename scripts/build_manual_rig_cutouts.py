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
    joints = data.get("joints", {})
    invalid = [name for name, point in joints.items()
               if not isinstance(point, list) or len(point) != 2
               or any(not isinstance(v, (int, float)) or v < 0 or v >= 1024 for v in point)]
    if invalid:
        raise ValueError("Invalid joint coordinates: " + ", ".join(invalid))
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
        # Produce a separate GrabCut candidate. The polygon remains the safe
        # baseline; candidate masks are experimental and never replace it.
        candidate_name = f"{part.replace('/', '-')}-grabcut-candidate.png"
        try:
            import cv2
            rgb = np.asarray(image.convert("RGB"))
            poly_mask = np.asarray(mask, dtype=np.uint8)
            ys0, xs0 = np.where(poly_mask > 0)
            if len(xs0):
                pad = 14
                x0, x1 = max(0, int(xs0.min())-pad), min(width, int(xs0.max())+pad+1)
                y0, y1 = max(0, int(ys0.min())-pad), min(height, int(ys0.max())+pad+1)
                roi_poly = poly_mask[y0:y1, x0:x1]
                labels = np.where(roi_poly > 0, cv2.GC_PR_FGD, cv2.GC_BGD).astype(np.uint8)
                kernel = np.ones((5,5), np.uint8)
                sure_fg = cv2.erode(roi_poly, kernel, iterations=2) > 0
                labels[sure_fg] = cv2.GC_FGD
                labels[(roi_poly > 0) & (~sure_fg)] = cv2.GC_PR_FGD
                bgd_model = np.zeros((1,65), np.float64)
                fgd_model = np.zeros((1,65), np.float64)
                cv2.grabCut(rgb[y0:y1,x0:x1].copy(), labels, None, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_MASK)
                refined = np.where((labels == cv2.GC_FGD) | (labels == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
                refined_full = np.zeros((height,width), dtype=np.uint8)
                refined_full[y0:y1,x0:x1] = refined
                refined_full = cv2.bitwise_and(refined_full, poly_mask)
                candidate_alpha = (alpha.astype(np.uint32) * refined_full.astype(np.uint32) // 255).astype(np.uint8)
                candidate = image.copy()
                candidate.putalpha(Image.fromarray(candidate_alpha, "L"))
                candidate.save(output / candidate_name, optimize=True)
        except Exception as exc:
            report.setdefault("grabcut_warnings", []).append(f"{part}: {type(exc).__name__}: {exc}")
        # Keep the full source canvas: all parts share exactly the same origin.
        filename = f"{part.replace('/', '-')}.png"
        cut.save(output / filename, optimize=True)
        ys, xs = np.where(cut_alpha > 8)
        bbox = [int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)] if len(xs) else [0,0,0,0]
        report["parts"].append({"id": part, "file": filename, "polygons": len(valid),
                                "pixels": int((cut_alpha > 8).sum()), "bbox": bbox,
                                "canvas_aligned": True})
    # Build a source-aligned overlay so reviewers can see whether each polygon
    # actually covers the intended visible region (isolated thumbnails can hide
    # grossly misplaced contours).
    overlay = image.copy()
    palette = [(255,70,70),(70,180,255),(255,190,60),(100,220,130),
               (210,120,255),(70,220,210),(255,120,190),(200,200,80)]
    for index, (part, spec) in enumerate(sorted(data.get("parts", {}).items())):
        mask_path = output / f"{part.replace('/', '-')}.png"
        if not mask_path.exists():
            continue
        layer = Image.open(mask_path).convert("RGBA")
        tint = Image.new("RGBA", (width,height), (*palette[index % len(palette)],0))
        alpha = layer.getchannel("A").point(lambda v: int(v * 0.42))
        tint.putalpha(alpha)
        overlay = Image.alpha_composite(overlay, tint)
    overlay.save(output / "source-overlay.png", optimize=True)
    report["visual_review"] = "source-overlay.png"
    report["segmentation_mode"] = "polygon-baseline-plus-experimental-grabcut-candidates"
    report["grabcut_candidate_count"] = len(list(output.glob("*-grabcut-candidate.png")))
    report["joint_count"] = len(joints)
    core_joints = ("pelvis", "neck", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist", "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle")
    required_parts = ("head", "torso", "pelvis", "left_upper_arm", "left_forearm", "left_hand", "right_upper_arm", "right_forearm", "right_hand", "left_thigh", "left_shin", "left_foot", "right_thigh", "right_shin", "right_foot", "weapon", "shield")
    report["missing_core_joints"] = [name for name in core_joints if name not in joints]
    exported_ids = {part["id"] for part in report["parts"]}
    report["missing_required_parts"] = [name for name in required_parts if name not in exported_ids]
    report["suspiciously_small_parts"] = [part["id"] for part in report["parts"] if part["pixels"] < 2500]
    report["ready_for_rigging"] = not report["missing_core_joints"] and not report["missing_required_parts"]
    report["ready_for_animation"] = False
    report["animation_blockers"] = ["hidden anatomy reconstruction", "layer overlap and edge inspection", "pivot and motion preview"]
    if not report["parts"]:
        report["status"] = "no-parts"
    elif not report["ready_for_rigging"]:
        report["status"] = "incomplete-annotation"
    else:
        report["status"] = "complete-annotation-awaiting-visual-qa"
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
