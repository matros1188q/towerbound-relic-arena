#!/usr/bin/env python3
"""Pose-keypoint reconnaissance for hand-authored fantasy character rigs.

This is deliberately a QA pass, not an automatic cutout/rig generator. COCO
pose landmarks can suggest pivots, but do not reveal occluded anatomy or
separate overlapping armor/weapons in a flattened illustration.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parents[1]
HEROES = ("warden", "ranger", "arcanist", "reaper")
MODEL = "yolo11n-pose.pt"
OUT = ROOT / "artifacts/pose-analysis"
# COCO-17 joints
JOINTS = {
    "nose": 0, "left_eye": 1, "right_eye": 2, "left_ear": 3, "right_ear": 4,
    "left_shoulder": 5, "right_shoulder": 6, "left_elbow": 7, "right_elbow": 8,
    "left_wrist": 9, "right_wrist": 10, "left_hip": 11, "right_hip": 12,
    "left_knee": 13, "right_knee": 14, "left_ankle": 15, "right_ankle": 16
}
SKELETON = [(5,7),(7,9),(6,8),(8,10),(5,6),(5,11),(6,12),(11,12),
            (11,13),(13,15),(12,14),(14,16)]

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    model = YOLO(MODEL)
    report = {
        "schema_version": 1,
        "method": "YOLO11n-pose COCO-17 keypoint inference",
        "model": MODEL,
        "purpose": "pivot candidates and visual QA only; not a rig or cutout",
        "confidence_threshold": 0.25,
        "downstream_review_pipeline": "extract_limb_candidates.py",
        "heroes": {}
    }
    for hero in HEROES:
        src = ROOT / f"assets/characters/heroes/{hero}.png"
        if not src.is_file():
            raise FileNotFoundError(src)
        rgba = Image.open(src).convert("RGBA")
        # White matte is closer to COCO training images than transparent checkerboards.
        matte = Image.new("RGBA", rgba.size, (238, 238, 238, 255))
        image = Image.alpha_composite(matte, rgba).convert("RGB")
        result = model.predict(np.asarray(image), conf=0.05, imgsz=1024, verbose=False)[0]
        draw = ImageDraw.Draw(image)
        detections = []
        if result.keypoints is not None and len(result.keypoints.data):
            scores = result.keypoints.conf
            for idx, points in enumerate(result.keypoints.xy.cpu().numpy()):
                confs = scores[idx].cpu().numpy() if scores is not None else np.ones(17)
                visible = {}
                for name, joint in JOINTS.items():
                    x, y = map(float, points[joint])
                    score = float(confs[joint])
                    if score >= 0.25:
                        visible[name] = {"x": round(x, 2), "y": round(y, 2), "confidence": round(score, 4)}
                for a, b in SKELETON:
                    if confs[a] >= 0.25 and confs[b] >= 0.25:
                        draw.line([tuple(points[a]), tuple(points[b])], fill=(20, 170, 255), width=5)
                for joint, (x, y) in enumerate(points):
                    if confs[joint] >= 0.25:
                        r = 7
                        draw.ellipse((x-r,y-r,x+r,y+r), fill=(255,70,50), outline=(30,30,30), width=2)
                detections.append({
                    "person_confidence": round(float(result.boxes.conf[idx]), 4) if result.boxes is not None else None,
                    "visible_joint_count": len(visible),
                    "joints": visible
                })
        detections.sort(key=lambda d: (d["visible_joint_count"], d["person_confidence"] or 0), reverse=True)
        best = detections[0] if detections else None
        # A pose is useful only when shoulders, elbows/wrists and hips/legs are present.
        required = ("left_shoulder","right_shoulder","left_elbow","right_elbow",
                    "left_wrist","right_wrist","left_hip","right_hip")
        required_count = sum(1 for j in required if best and j in best["joints"])
        status = "candidate-pivots-only" if best and required_count >= 6 and best["visible_joint_count"] >= 10 else "manual-landmarking-required"
        preview = OUT / f"{hero}-pose-qa.png"
        image.save(preview, optimize=True)
        report["heroes"][hero] = {
            "source": f"assets/characters/heroes/{hero}.png",
            "detections": detections,
            "best_pose": best,
            "required_upper_body_joints_found": required_count,
            "status": status,
            "preview": str(preview.relative_to(ROOT)),
            "warnings": [
                "Pose model was trained on real-person COCO imagery, not fantasy character art.",
                "Keypoints do not segment limbs, armor, hands, weapons, or hidden pixels.",
                "Do not feed these landmarks into gameplay until an operator verifies every pivot against the source art."
            ]
        }
        print(f"{hero}: {status}; detections={len(detections)}; joints={best['visible_joint_count'] if best else 0}")
    (OUT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Report: {OUT / 'report.json'}")

if __name__ == "__main__":
    main()
