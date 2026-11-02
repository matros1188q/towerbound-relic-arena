#!/usr/bin/env python3
"""Review-only limb cutout candidates. Never production rig data."""
from pathlib import Path
import json, math
import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/"artifacts/pose-analysis/report.json"
OUT=ROOT/"artifacts/limb-candidates"
HEROES=("warden","ranger","arcanist","reaper")
LIMBS={
 "left_upper_arm":("left_shoulder","left_elbow",.24),
 "left_forearm":("left_elbow","left_wrist",.21),
 "right_upper_arm":("right_shoulder","right_elbow",.24),
 "right_forearm":("right_elbow","right_wrist",.21),
 "left_thigh":("left_hip","left_knee",.27),
 "left_shin":("left_knee","left_ankle",.22),
 "right_thigh":("right_hip","right_knee",.27),
 "right_shin":("right_knee","right_ankle",.22)}
def capsule(a,b,r):
 ax,ay=a; bx,by=b; angle=math.atan2(by-ay,bx-ax)
 pts=[]
 for i in range(13):
  t=angle+math.pi/2+math.pi*i/12; pts.append((round(ax+r*math.cos(t)),round(ay+r*math.sin(t))))
 for i in range(13):
  t=angle-math.pi/2+math.pi*i/12; pts.append((round(bx+r*math.cos(t)),round(by+r*math.sin(t))))
 return np.asarray(pts,np.int32)
def main():
 data=json.loads(REPORT.read_text()); OUT.mkdir(parents=True,exist_ok=True)
 summary={"schema_version":1,"status":"review-only","heroes":{}}
 for hero in HEROES:
  rgba=np.asarray(Image.open(ROOT/f"assets/characters/heroes/{hero}.png").convert("RGBA"))
  h,w=rgba.shape[:2]; rgb=cv2.cvtColor(rgba[:,:,:3],cv2.COLOR_RGB2BGR); alpha=rgba[:,:,3]
  pose=data["heroes"][hero].get("best_pose"); parts={}
  if not pose: summary["heroes"][hero]={"status":"no-pose","parts":parts}; continue
  joints=pose["joints"]; overlay=np.zeros((h,w,4),np.uint8)
  for i,(name,(ja,jb,ratio)) in enumerate(LIMBS.items()):
   if ja not in joints or jb not in joints: parts[name]={"status":"missing-joint"}; continue
   a=(joints[ja]["x"],joints[ja]["y"]); b=(joints[jb]["x"],joints[jb]["y"]); length=math.dist(a,b)
   if length<12: parts[name]={"status":"degenerate"}; continue
   radius=max(11,min(66,length*ratio)); poly=capsule(a,b,radius)
   x0=max(0,int(min(a[0],b[0])-radius-12)); x1=min(w,int(max(a[0],b[0])+radius+13))
   y0=max(0,int(min(a[1],b[1])-radius-12)); y1=min(h,int(max(a[1],b[1])+radius+13))
   if x1<=x0 or y1<=y0: parts[name]={"status":"bad-roi"}; continue
   al=alpha[y0:y1,x0:x1]; im=rgb[y0:y1,x0:x1]; shape=al.shape
   corridor=np.zeros(shape,np.uint8); cv2.fillPoly(corridor,[poly-np.array([x0,y0])],1)
   core=np.zeros(shape,np.uint8); cv2.fillPoly(core,[capsule(a,b,max(4,radius*.48))-np.array([x0,y0])],1)
   gc=np.full(shape,cv2.GC_BGD,np.uint8); gc[corridor>0]=cv2.GC_PR_FGD
   gc[(core>0)&(al>8)]=cv2.GC_FGD; gc[al<=8]=cv2.GC_BGD
   er=cv2.erode(corridor,np.ones((5,5),np.uint8),iterations=1)
   gc[(corridor>0)&(er==0)&(gc!=cv2.GC_FGD)]=cv2.GC_PR_BGD
   try:
    bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
    cv2.grabCut(im,gc,None,bg,fg,3,cv2.GC_INIT_WITH_MASK)
    mask=np.where((gc==cv2.GC_FGD)|(gc==cv2.GC_PR_FGD),255,0).astype(np.uint8)
   except cv2.error: mask=corridor*255
   mask=cv2.bitwise_and(mask,al)
   n,labels,stats,centers=cv2.connectedComponentsWithStats((mask>12).astype(np.uint8),8)
   if n>1:
    mx=(a[0]+b[0])/2-x0; my=(a[1]+b[1])/2-y0
    keep=min((math.hypot(centers[k][0]-mx,centers[k][1]-my),k) for k in range(1,n) if stats[k,cv2.CC_STAT_AREA]>=12)[1]
    mask=np.where(labels==keep,255,0).astype(np.uint8)
   ys,xs=np.where(mask>0)
   if len(xs)<20: parts[name]={"status":"too-small","pixels":int(len(xs))}; continue
   full=np.zeros((h,w),np.uint8); full[y0:y1,x0:x1]=mask
   box=(xs.min()+x0,ys.min()+y0,xs.max()+x0+1,ys.max()+y0+1)
   cut=rgba[box[1]:box[3],box[0]:box[2]].copy(); cut[:,:,3]=full[box[1]:box[3],box[0]:box[2]]
   dest=OUT/hero/name; dest.mkdir(parents=True,exist_ok=True); Image.fromarray(cut,"RGBA").save(dest/"candidate.png",optimize=True)
   color=((35+i*37)%255,(170+i*19)%255,(225-i*23)%255)
   overlay[:,:,:3][full>0]=color; overlay[:,:,3][full>0]=105
   parts[name]={"status":"candidate-needs-visual-approval","pixels":int((full>0).sum()),"bbox":[int(v) for v in box],"pivots":[ja,jb],"confidence":[joints[ja]["confidence"],joints[jb]["confidence"]],"cutout":str((dest/"candidate.png").relative_to(ROOT))}
  base=Image.fromarray(rgba,"RGBA"); preview=Image.alpha_composite(base,Image.fromarray(overlay,"RGBA")); preview.save(OUT/f"{hero}-limb-candidates.png",optimize=True)
  summary["heroes"][hero]={"status":"review-only","parts":parts,"preview":str((OUT/f"{hero}-limb-candidates.png").relative_to(ROOT))}
  print(hero, sum(p.get("status")=="candidate-needs-visual-approval" for p in parts.values()),"candidate parts")
 (OUT/"report.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n")
if __name__=="__main__": main()
