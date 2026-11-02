#!/usr/bin/env python3
"""Build human-review sheets for hero cutout candidates; never certify a rig automatically."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
HEROES=("warden","ranger","arcanist","reaper")
LIMBS=("left_upper_arm","left_forearm","right_upper_arm","right_forearm",
       "left_thigh","left_shin","right_thigh","right_shin")
POSE=ROOT/"artifacts/pose-analysis"
LIMB=ROOT/"artifacts/limb-candidates"
OUT=ROOT/"artifacts/hero-rig-visual-review"
BG=(35,38,45,255); PANEL=(52,57,67,255); WHITE=(238,240,244,255)
def font(size=20):
    try: return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",size)
    except OSError: return ImageFont.load_default()
def contain(im, size):
    im=im.convert("RGBA"); im.thumbnail(size,Image.Resampling.LANCZOS)
    canvas=Image.new("RGBA",size,(24,26,31,255))
    canvas.alpha_composite(im,((size[0]-im.width)//2,(size[1]-im.height)//2))
    return canvas
def checker(size, cell=16):
    im=Image.new("RGBA",size,(0,0,0,255)); d=ImageDraw.Draw(im)
    for y in range(0,size[1],cell):
        for x in range(0,size[0],cell):
            c=(74,78,86,255) if ((x//cell+y//cell)%2)==0 else (48,52,60,255)
            d.rectangle((x,y,x+cell-1,y+cell-1),fill=c)
    return im
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    pose_report=json.loads((POSE/"report.json").read_text()) if (POSE/"report.json").exists() else {"heroes":{}}
    limb_report=json.loads((LIMB/"report.json").read_text()) if (LIMB/"report.json").exists() else {"heroes":{}}
    rows=[]
    for hero in HEROES:
        source=Image.open(ROOT/f"assets/characters/heroes/{hero}.png").convert("RGBA")
        pose_path=POSE/f"{hero}-pose-qa.png"
        limb_preview=LIMB/f"{hero}-limb-candidates.png"
        cards=[]
        for title,path in (("ORIGINAL",ROOT/f"assets/characters/heroes/{hero}.png"),
                           ("POSE LANDMARKS",pose_path),("LIMB CANDIDATE OVERLAY",limb_preview)):
            if path.exists():
                tile=contain(Image.open(path),(430,430))
                cards.append((title,tile))
        w,h=1400,1200
        sheet=Image.new("RGBA",(w,h),BG); draw=ImageDraw.Draw(sheet)
        draw.text((28,20),f"{hero.upper()} — CUTOUT REVIEW / NOT APPROVED FOR RIGGING",font=font(27),fill=WHITE)
        for i,(label,tile) in enumerate(cards):
            x=25+i*455
            draw.rounded_rectangle((x,70,x+440,535),radius=12,fill=PANEL)
            draw.text((x+14,82),label,font=font(17),fill=WHITE)
            sheet.alpha_composite(tile,(x+5,105))
        draw.text((28,555),"INDIVIDUAL LIMB MASKS — checkerboard means transparent pixels",font=font(20),fill=WHITE)
        report_parts=limb_report.get("heroes",{}).get(hero,{}).get("parts",{})
        status_rows=[]
        for i,name in enumerate(LIMBS):
            col=i%4; row=i//4; x=25+col*345; y=590+row*285
            draw.rounded_rectangle((x,y,x+330,y+265),radius=10,fill=PANEL)
            draw.text((x+10,y+8),name,font=font(15),fill=WHITE)
            p=report_parts.get(name,{})
            rel=p.get("cutout")
            if rel and (ROOT/rel).exists():
                part=Image.open(ROOT/rel).convert("RGBA")
                tile=checker((300,210)); part.thumbnail((290,200),Image.Resampling.LANCZOS)
                tile.alpha_composite(part,((300-part.width)//2,(210-part.height)//2))
                sheet.alpha_composite(tile,(x+15,y+35))
            else:
                draw.text((x+15,y+90),p.get("status","not generated"),font=font(14),fill=(255,190,130,255))
            status_rows.append({"part":name,**p})
        out=OUT/f"{hero}-review.png"; sheet.convert("RGB").save(out,optimize=True)
        rows.append({"hero":hero,"sheet":str(out.relative_to(ROOT)),
                     "pose_status":pose_report.get("heroes",{}).get(hero,{}).get("status","not-run"),
                     "limb_status":limb_report.get("heroes",{}).get(hero,{}).get("status","not-run"),
                     "parts":status_rows})
    report={"schema_version":1,"purpose":"human visual inspection only; not production rig approval",
            "approval_rule":"No source part is accepted until anatomy, occlusion, hidden-pixel reconstruction and pivot placement are manually verified.",
            "heroes":rows}
    (OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    html=["<!doctype html><meta charset='utf-8'><title>Towerbound hero cutout review</title>",
          "<style>body{background:#20232a;color:#eee;font:16px system-ui;margin:24px}img{max-width:100%;height:auto;border:1px solid #555;border-radius:8px}section{margin:32px 0}small{color:#bbb}</style>",
          "<h1>Towerbound — Hero Cutout Visual Review</h1>",
          "<p>Candidate masks are not final art. Inspect joint overlap, missing hidden anatomy, armor occlusion and weapon boundaries before any rig is approved.</p>"]
    for row in rows:
        html.append(f"<section><h2>{row['hero']}</h2><small>Pose: {row['pose_status']} · Limbs: {row['limb_status']}</small><p><img src='{row['hero']}-review.png'></p></section>")
    (OUT/"index.html").write_text("\n".join(html)+"\n",encoding="utf-8")
    print(json.dumps({"review_sheets":len(rows),"output":str(OUT.relative_to(ROOT))},indent=2))
if __name__=="__main__": main()
