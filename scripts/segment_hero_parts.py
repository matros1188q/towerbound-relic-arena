#!/usr/bin/env python3
"""Free semantic cutout pass for Towerbound hero source art.

This creates category masks from an open Hugging Face SegFormer clothes model.
It is an extraction aid, NOT a finished skeletal rig: weapon-specific masks,
joint overlap reconstruction and artist QA remain explicit gates.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from transformers import AutoImageProcessor, SegformerForSemanticSegmentation

ROOT = Path(__file__).resolve().parents[1]
MODEL = "mattmdjaga/segformer_b2_clothes"
HEROES = ("warden", "ranger", "arcanist", "reaper")
OUT = ROOT / "assets/characters/rig-parts/semantic-pass"
DEVICE = "cpu"

def safe_name(value):
    return "".join(c.lower() if c.isalnum() else "-" for c in value).strip("-")

def main():
    torch.set_num_threads(2)
    processor = AutoImageProcessor.from_pretrained(MODEL)
    model = SegformerForSemanticSegmentation.from_pretrained(MODEL).to(DEVICE).eval()
    report = {
        "schema_version": 1,
        "method": "open-source semantic segmentation (SegFormer clothes)",
        "model": MODEL,
        "status": "semantic-masks-require-visual-qa-and-joint-reconstruction",
        "heroes": {}
    }
    for hero in HEROES:
        src = ROOT / f"assets/characters/heroes/{hero}.png"
        if not src.exists():
            raise FileNotFoundError(src)
        rgba = Image.open(src).convert("RGBA")
        alpha = np.asarray(rgba.getchannel("A"), dtype=np.uint8)
        # Composite transparent art over neutral gray for stable model inference.
        bg = Image.new("RGBA", rgba.size, (116, 116, 116, 255))
        rgb = Image.alpha_composite(bg, rgba).convert("RGB")
        inputs = processor(images=rgb, return_tensors="pt")
        with torch.inference_mode():
            logits = model(**inputs).logits
            logits = F.interpolate(logits, size=(rgba.height, rgba.width), mode="bilinear", align_corners=False)
            labels = logits.argmax(dim=1)[0].cpu().numpy().astype(np.uint8)
        hero_out = OUT / hero
        hero_out.mkdir(parents=True, exist_ok=True)
        id2label = {int(k): str(v) for k, v in model.config.id2label.items()}
        entries = []
        for class_id, label in sorted(id2label.items()):
            if class_id == 0:
                continue
            mask = ((labels == class_id) & (alpha > 8)).astype(np.uint8) * 255
            pixels = int((mask > 0).sum())
            if pixels < 100:
                continue
            ys, xs = np.where(mask > 0)
            bbox = [int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)]
            # Preserve original pixels and original alpha; only semantic mask is changed.
            part = np.asarray(rgba).copy()
            part[:, :, 3] = ((part[:, :, 3].astype(np.uint16) * mask.astype(np.uint16)) // 255).astype(np.uint8)
            filename = f"{safe_name(label)}.png"
            Image.fromarray(part, "RGBA").crop(tuple(bbox)).save(hero_out / filename, optimize=True)
            entries.append({
                "label": label, "class_id": class_id, "file": filename,
                "pixels": pixels, "bbox": bbox,
                "coverage": round(pixels / max(1, int((alpha > 8).sum())), 5)
            })
        report["heroes"][hero] = {
            "source": f"assets/characters/heroes/{hero}.png",
            "source_size": list(rgba.size),
            "parts": entries,
            "warnings": [
                "Model labels are semantic clothing categories, not a complete anatomy rig.",
                "Weapons and overlapping armor may be omitted or assigned to another class.",
                "Do not animate until boundaries, occlusion patches and pivots pass visual QA."
            ]
        }
        print(f"{hero}: {len(entries)} masks")
    (OUT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    main()
