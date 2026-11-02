#!/usr/bin/env python3
"""Generate conservative, review-only limb cutout candidates from pose pivots.

No candidate is promoted to a production rig automatically. Each mask is
visually inspected before use because flattened art contains occlusions.
"""
from pathlib import Path
import json
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "artifacts/pose-analysis/report.json"
OUT = ROOT / "artifacts/limb-candidates"
HEROES = ("warden", "ranger", "arcanist", "reaper")
LIMBS = {
    "left_upper_arm": ("left_shoulder", "left_elbow", 0.105),
    "left_forearm": ("left_elbow", "left_wrist", 0.085),
    "right_upper_arm": ("right_shoulder", "right_elbow", 0.105),
    "right_forearm": ("right_elbow", "right_wrist", 0.085),
    "left_thigh": ("left_hip", "left_knee", 0.13),
    "left_shin": ("left_knee", "left_ankle", 0.10),
    "right_thigh": ("right_hip", "right_knee", 0.13),
    "right_shin": ("right_knee", "right_ankle", 0.10),
}

def capsule_polygon(a, b, radius, steps=12):
    ax, ay = a; bx, by = b
    angle = math.atan2(by-ay, bx-ax)
    pts = []
    for i in range(steps+1):
        t = angle + math.pi/2 + math.pi*i/steps
        pts.append((int(round(ax+radius*math.cos(t))), int(round(ay+radius*math.sin(t)))))
    for i in range(steps+1):
        t = angle - math.pi/2 + math.pi*i/steps
        pts.append((int(round(bx+radius*math.cos(t))), int(round(by+radius*math.sin(t)))))
    return np.asarray(pts, dtype=np.int32)

def main():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    summary = {"schema_version": 1, "status": "review-only", "heroes": {}}
    for hero in HEROES:
        source = ROOT / f"assets/characters/heroes/{hero}.png"
        rgba = np.asarray(Image.open(source).convert("RGBA"))
        h, w = rgba.shape[:2]
        rgb = cv2.cvtColor(rgba[:,:,:3], cv2.COLOR_RGB2BGR)
        alpha = rgba[:,:,3]
        pose = data["heroes"][hero].get("best_pose")
        if not pose:
            summary["heroes"][hero] = {"status":"no-pose", "parts":{}}
            continue
        joints = pose["joints"]
        preview = Image.fromarray(rgba.copy(), "RGBA")
        overlay = Image.new("RGBA", (w,h), (0,0,0,0))
        od = ImageDraw.Draw(overlay)
        parts = {}
        for index, (name,(ja,jb,width_ratio)) in enumerate(LIMBS.items()):
            if ja not in joints or jb not in joints:
                parts[name] = {"status":"missing-joint"}
                continue
            a = (joints[ja]["x"], joints[ja]["y"])
            b = (joints[jb]["x"], joints[jb]["y"])
            length = math.dist(a,b)
            if length < 12:
                parts[name] = {"status":"degenerate-segment","length":round(length,2)}
                continue
            radius = max(11.0, min(66.0, length*width_ratio))
            poly = capsule_polygon(a,b,radius)
            x0=max(0,int(min(a[0],b[0])-radius-12)); x1=min(w,int(max(a[0],b[0])+radius+13))
            y0=max(0,int(min(a[1],b[1])-radius-12)); y1=min(h,int(max(a[1],b[1])+radius+13))
            if x1<=x0 or y1<=y0:
                parts[name]={"status":"invalid-roi"}; continue
            local_poly=poly-np.array([x0,y0],dtype=np.int32)
            roi_alpha=alpha[y0:y1,x0:x1]
            roi_rgb=rgb[y0:y1,x0:x1]
            shape=roi_alpha.shape
            corridor=np.zeros(shape,dtype=np.uint8)
            cv2.fillPoly(corridor,[local_poly],1)
            core=np.zeros(shape,dtype=np.uint8)
            inner= capsule_polygon(a,b,max(4.0,radius*0.48))-np.array([x0,y0],dtype=np.int32)
            cv2.fillPoly(core,[inner],1)
            # GrabCut classes: sure background outside; probable FG in corridor;
            # sure FG only on the centerline core where the original alpha exists.
            gc=np.full(shape,cv2.GC_BGD,dtype=np.uint8)
            gc[corridor>0]=cv2.GC_PR_FGD
            gc[(core>0)&(roi_alpha>8)]=cv2.GC_FGD
            gc[roi_alpha<=8]=cv2.GC_BGD
            # Add a narrow probable-background rim inside the corridor.
            eroded=cv2.erode(corridor,np.ones((5,5),np.uint8),iterations=1)
            gc[(corridor>0)&(eroded==0)&(gc!=cv2.GC_FGD)]=cv2.GC_PR_BGD
            try:
                bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
                cv2.grabCut(roi_rgb,gc,None,bg,fg,3,cv2.GC_INIT_WITH_MASK)
                mask=np.where((gc==cv2.GC_FGD)|(gc==cv2.GC_PR_FGD),255,0).astype(np.uint8)
            except cv2.error:
                mask=(corridor*255).astype(np.uint8)
            mask=cv2.bitwise_and(mask,roi_alpha)
            # Remove isolated specks, retain the component nearest the limb midpoint.
            count, labels, stats, centers=cv2.connectedComponentsWithStats((mask>12).astype(np.uint8),8)
            if count>1:
                mx=int((a[0]+b[0])/2)-x0; my=int((a[1]+b[1])/2)-y0
                candidates=[]
                for lab in range(1,count):
                    if stats[lab,cv2.CC_STAT_AREA]>=12:
                        cx,cy=centers[lab]
                        candidates.append((math.hypot(cx-mx,cy-my),lab))
                if candidates:
                    keep=min(candidates)[1]
                    mask=np.where(labels==keep,255,0).astype(np.uint8)
            ys,xs=np.where(mask>0)
            if len(xs)<20:
                parts[name]={"status":"empty-or-too-small","pixels":int(len(xs))}
                continue
            full=np.zeros((h,w),dtype=np.uint8); full[y0:y1,x0:x1]=mask
            crop_box=(int(xs.min()+x0),int(ys.min()+y0),int(xs.max()+x0+1),int(ys.max()+y0+1))
            cut=rgba[crop_box[1]:crop_box[3],crop_box[0]:crop_box[2]].copy()
            cut[:,:,3]=full[crop_box[1]:crop_box[3],crop_box[0]:crop_box[2]]
            part_path=OUT/hero/name
            part_path.mkdir(parents=True,exist_ok=True)
            Image.fromarray(cut,"RGBA").save(part_path/"candidate.png",optimize=True)
            color=((40+index*31)%220+25,(170+index*17)%230+20,(230-index*19)%230+20,105)
            colored=np.zeros((h,w,4),dtype=np.uint8); colored[:,:,:3]=color[:3]; colored[:,:,3]=np.where(full>0,color[3],0)
            overlay=Image.alpha_composite(overlay,Image.fromarray(colored,"RGBA"))
            parts[name]={
                "status":"candidate-needs-visual-approval","pixels":int((full>0).sum()),
                "bbox":[int(v) for v in crop_box],"pivot_a":ja,"pivot_b":jb,
                "pivot_confidence":[joints[ja]["confidence"],joints[jb]["confidence"]],
                "source_image_unchanged":True,
                "cutout":str((part_path/"candidate.png").relative_to(ROOT))
            }
        preview=Image.alpha_composite(preview,overlay)
        preview.save(OUT/f"{hero}-limb-candidates.png",optimize=True)
        summary["heroes"][hero]={"status":"review-only","parts":parts,"preview":str((OUT/f"{hero}-limb-candidates.png").relative_to(ROOT))}
        print(hero+": "+str(sum(1 for p in parts.values() if p.get("status")=="candidate-needs-visual-approval"))+" candidate parts")
    (OUT/"report.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

if __name__=="__main__":
    main()
