#!/usr/bin/env python3
"""SAM-assisted, review-only cutout proposals from pose landmarks.

No candidate is marked production-ready. Hidden anatomy cannot be recovered
from a flattened image by segmentation; this pipeline explicitly reports it.
"""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image, ImageDraw
from ultralytics import SAM

ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/"artifacts/pose-analysis/report.json"
OUT=ROOT/"artifacts/limb-candidates"
HEROES=("warden","ranger","arcanist","reaper")
LIMBS={
 "left_upper_arm":("left_shoulder","left_elbow"),
 "left_forearm":("left_elbow","left_wrist"),
 "right_upper_arm":("right_shoulder","right_elbow"),
 "right_forearm":("right_elbow","right_wrist"),
 "left_thigh":("left_hip","left_knee"),
 "left_shin":("left_knee","left_ankle"),
 "right_thigh":("right_hip","right_knee"),
 "right_shin":("right_knee","right_ankle")}
MODEL="sam2.1_b.pt"
def clamp(v,lo,hi): return max(lo,min(hi,v))
def prompt_points(a,b,w,h):
    dx,dy=b[0]-a[0],b[1]-a[1]; length=max(1,math.hypot(dx,dy))
    nx,ny=-dy/length,dx/length
    pts=[]
    for t in (.16,.36,.58,.80):
        pts.append([clamp(a[0]+dx*t,0,w-1),clamp(a[1]+dy*t,0,h-1)])
    # Negative prompts on both sides of the limb centerline.
    mid=((a[0]+b[0])/2,(a[1]+b[1])/2)
    offset=max(9,min(30,length*.22))
    pts.extend([[clamp(mid[0]+nx*offset,0,w-1),clamp(mid[1]+ny*offset,0,h-1)],
                [clamp(mid[0]-nx*offset,0,w-1),clamp(mid[1]-ny*offset,0,h-1)]])
    return np.asarray([pts],dtype=np.float32),np.asarray([[1,1,1,1,0,0]],dtype=np.int32)
def score_mask(mask,a,b):
    ys,xs=np.where(mask)
    if len(xs)<30: return -1
    h,w=mask.shape; yy,xx=np.mgrid[:h,:w]
    dx,dy=b[0]-a[0],b[1]-a[1]; den=max(1,dx*dx+dy*dy)
    t=np.clip(((xx-a[0])*dx+(yy-a[1])*dy)/den,0,1)
    dist=np.hypot(xx-(a[0]+t*dx),yy-(a[1]+t*dy))
    length=max(1,math.hypot(dx,dy)); radius=max(9,min(48,length*.32))
    selected=mask
    d=dist[selected]
    center=float(np.mean(d<radius*1.35)) if d.size else 0
    # Penalize huge masks that swallow torso/shield or neighboring limbs.
    area=len(xs); area_penalty=max(0,area/(length*radius*5)-1)
    return center-0.30*area_penalty, (int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)),center
def main():
    data=json.loads(REPORT.read_text()); OUT.mkdir(parents=True,exist_ok=True)
    model=SAM(MODEL)
    summary={"schema_version":2,"status":"review-only","method":"SAM2 point-prompt proposals seeded by pose landmarks",
             "model":MODEL,"important_limitations":[
              "Pose landmarks may be wrong on stylized fantasy illustrations and require manual correction.",
              "Segmentation separates visible pixels only; it cannot reconstruct body pixels hidden behind armor, weapons or clothing.",
              "Every mask and pivot requires visual approval; no production rig data is emitted."],"heroes":{}}
    for hero in HEROES:
        rgba=np.asarray(Image.open(ROOT/f"assets/characters/heroes/{hero}.png").convert("RGBA"))
        h,w=rgba.shape[:2]; rgb=rgba[:,:,:3].copy()
        # SAM sees a neutral matte where source transparency exists.
        alpha=rgba[:,:,3:4].astype(np.float32)/255
        rgb=(rgb*alpha+np.array([90,90,96],np.float32)*(1-alpha)).astype(np.uint8)
        pose=data["heroes"][hero].get("best_pose"); parts={}; overlay=np.zeros((h,w,4),np.uint8)
        if not pose:
            summary["heroes"][hero]={"status":"manual-landmarking-required","parts":{}}
            continue
        joints=pose["joints"]
        for i,(name,(ja,jb)) in enumerate(LIMBS.items()):
            if ja not in joints or jb not in joints:
                parts[name]={"status":"missing-pose-landmark","needs_manual_landmarks":[ja,jb]}; continue
            a=(joints[ja]["x"],joints[ja]["y"]); b=(joints[jb]["x"],joints[jb]["y"])
            length=math.dist(a,b)
            if length<15:
                parts[name]={"status":"invalid-pose-landmark","needs_manual_landmarks":[ja,jb]}; continue
            points,labels=prompt_points(a,b,w,h)
            try:
                result=model.predict(rgb,points=points,labels=labels,conf=0.15,verbose=False)[0]
                if result.masks is None or len(result.masks.data)==0:
                    parts[name]={"status":"sam-no-mask"}; continue
                proposals=[]
                for j,m in enumerate(result.masks.data.cpu().numpy()):
                    m=Image.fromarray((m>0.5).astype(np.uint8)*255).resize((w,h),Image.Resampling.NEAREST)
                    mask=np.asarray(m)>0
                    # Respect original transparency.
                    mask &= rgba[:,:,3]>8
                    s,bbox,center=score_mask(mask,a,b)
                    proposals.append((s,bbox,center,mask))
                proposals.sort(key=lambda x:x[0],reverse=True)
                best=proposals[0]
                if best[0]<0.18 or best[2]<0.45:
                    parts[name]={"status":"low-confidence-needs-manual-mask","proposal_count":len(proposals),
                                 "score":round(best[0],3),"centerline_coverage":round(best[2],3)}; continue
                _,box,center,mask=best; x0,y0,x1,y1=box
                cut=rgba[y0:y1,x0:x1].copy()
                cut[:,:,3]=np.where(mask[y0:y1,x0:x1],rgba[y0:y1,x0:x1,3],0)
                dest=OUT/hero/name; dest.mkdir(parents=True,exist_ok=True)
                Image.fromarray(cut,"RGBA").save(dest/"candidate.png",optimize=True)
                color=((35+i*37)%255,(170+i*19)%255,(225-i*23)%255)
                overlay[:,:,:3][mask]=color; overlay[:,:,3][mask]=105
                parts[name]={"status":"sam-candidate-needs-visual-approval","pixels":int(mask.sum()),
                             "bbox":[int(v) for v in box],"pivots":[ja,jb],
                             "landmark_confidence":[joints[ja]["confidence"],joints[jb]["confidence"]],
                             "sam_score":round(best[0],3),"centerline_coverage":round(center,3),
                             "proposal_count":len(proposals),"cutout":str((dest/"candidate.png").relative_to(ROOT)),
                             "hidden_pixel_reconstruction":"not-possible-from-source"}
            except Exception as exc:
                parts[name]={"status":"sam-error","error":str(exc)[:240]}
        base=Image.fromarray(rgba,"RGBA")
        Image.alpha_composite(base,Image.fromarray(overlay,"RGBA")).save(OUT/f"{hero}-limb-candidates.png",optimize=True)
        good=sum(p.get("status")=="sam-candidate-needs-visual-approval" for p in parts.values())
        summary["heroes"][hero]={"status":"review-only","candidate_count":good,"parts":parts,
                                 "preview":str((OUT/f"{hero}-limb-candidates.png").relative_to(ROOT))}
        print(f"{hero}: {good}/{len(LIMBS)} SAM candidates")
    (OUT/"report.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if __name__=="__main__": main()
