#!/usr/bin/env python3
"""Rebuild full-canvas semantic cutouts and contact sheets for hero-rig review.

The source masks are clothing-class proposals, not anatomy parts. This tool
preserves source coordinates and explicitly refuses to label them production rigs.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "assets/characters/rig-parts/semantic-pass/report.json"
OUT = ROOT / "artifacts/semantic-full-canvas"
HEROES = ("warden", "ranger", "arcanist", "reaper")
BG = (37, 40, 48, 255)
COLORS = ((100,180,255,105),(255,170,90,105),(150,220,150,105),
          (210,150,255,105),(255,220,120,105),(255,130,160,105))

def font(size=18):
    try: return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except OSError: return ImageFont.load_default()

def checker(size, cell=16):
    im=Image.new("RGBA",size,BG); d=ImageDraw.Draw(im)
    for y in range(0,size[1],cell):
        for x in range(0,size[0],cell):
            if (x//cell+y//cell)%2: d.rectangle((x,y,x+cell-1,y+cell-1),fill=(57,61,71,255))
    return im

def main():
    data=json.loads(REPORT.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True,exist_ok=True)
    summary={"schema_version":1,"status":"review-only","purpose":"restore original canvas coordinates for semantic clothing masks",
             "not_a_rig":True,"heroes":{},"errors":[]}
    html=["<!doctype html><meta charset='utf-8'><title>Hero semantic cutout QA</title>",
          "<style>body{background:#20232a;color:#eee;font:16px system-ui;margin:24px}section{margin:36px 0}img{max-width:100%;height:auto;border:1px solid #555;border-radius:8px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.grid img{width:100%}small{color:#bbb}</style>",
          "<h1>Towerbound — semantic cutout QA</h1>",
          "<p>These are clothing-category masks, not anatomical limbs. Transparent gaps are not reconstructed. No character is approved for skeletal animation by this report.</p>"]
    for hero in HEROES:
        hdata=data.get("heroes",{}).get(hero)
        if not hdata: summary["errors"].append(f"{hero}: missing semantic report"); continue
        source_path=ROOT/hdata["source"]
        if not source_path.is_file(): summary["errors"].append(f"{hero}: missing source {source_path}"); continue
        source=Image.open(source_path).convert("RGBA")
        w,h=source.size
        overlay=source.copy()
        hero_out=OUT/hero; hero_out.mkdir(parents=True,exist_ok=True)
        rows=[]; tiles=[]
        for idx,part in enumerate(hdata.get("parts",[])):
            bbox=part.get("bbox")
            if not isinstance(bbox,list) or len(bbox)!=4:
                summary["errors"].append(f"{hero}/{part.get('label')}: invalid bbox"); continue
            x0,y0,x1,y1=map(int,bbox)
            if not (0<=x0<x1<=w and 0<=y0<y1<=h):
                summary["errors"].append(f"{hero}/{part.get('label')}: bbox outside source canvas"); continue
            cropped_path=ROOT/"assets/characters/rig-parts/semantic-pass"/hero/part["file"]
            if not cropped_path.is_file():
                summary["errors"].append(f"{hero}/{part.get('label')}: missing {cropped_path}"); continue
            crop=Image.open(cropped_path).convert("RGBA")
            expected=(x1-x0,y1-y0)
            if crop.size!=expected:
                summary["errors"].append(f"{hero}/{part.get('label')}: crop size {crop.size} != bbox {expected}"); continue
            full=Image.new("RGBA",(w,h),(0,0,0,0)); full.alpha_composite(crop,(x0,y0))
            dest=hero_out/(Path(part["file"]).stem+".full.png")
            full.save(dest,optimize=True)
            tint=Image.new("RGBA",(w,h),COLORS[idx%len(COLORS)])
            tint.putalpha(full.getchannel("A").point(lambda a: int(a*0.58)))
            overlay=Image.alpha_composite(overlay,tint)
            tile=checker((256,256))
            thumb=full.copy(); thumb.thumbnail((244,244),Image.Resampling.LANCZOS)
            tile.alpha_composite(thumb,((256-thumb.width)//2,(256-thumb.height)//2))
            tiles.append((part["label"],tile))
            area=int((full.getchannel("A").getbbox() is not None) and part.get("pixels",0))
            coverage=float(part.get("coverage",0))
            flags=[]
            if coverage>=0.65: flags.append("over-broad class")
            if coverage<0.003: flags.append("tiny fragment")
            rows.append({"label":part["label"],"file":str(dest.relative_to(ROOT)),
                         "bbox":bbox,"pixels":area,"coverage":coverage,"flags":flags,
                         "classification":"semantic-clothing-only"})
        overlay_path=hero_out/"overlay.png"; overlay.save(overlay_path,optimize=True)
        # Compact per-hero sheet with full source-coordinate mask tiles.
        cols=4; cellw=270; cellh=292; rows_n=max(1,(len(tiles)+cols-1)//cols)
        sheet=Image.new("RGBA",(cols*cellw,70+rows_n*cellh),(29,32,39,255)); draw=ImageDraw.Draw(sheet)
        draw.text((18,18),f"{hero.upper()} — SEMANTIC MASKS / NOT A RIG",font=font(22),fill=(245,245,248,255))
        for i,(label,tile) in enumerate(tiles):
            x=(i%cols)*cellw+7; y=70+(i//cols)*cellh
            draw.rounded_rectangle((x,y,x+cellw-14,y+cellh-12),radius=10,fill=(49,53,63,255))
            draw.text((x+9,y+8),label,font=font(15),fill=(245,245,248,255))
            sheet.alpha_composite(tile,(x+7,y+32))
        sheet_path=hero_out/"review-sheet.png"; sheet.convert("RGB").save(sheet_path,optimize=True)
        summary["heroes"][hero]={"source_size":[w,h],"part_count":len(rows),"parts":rows,
            "overlay":str(overlay_path.relative_to(ROOT)),"review_sheet":str(sheet_path.relative_to(ROOT)),
            "production_ready":False,"blockers":["semantic labels are not anatomy","hidden pixels are not reconstructed","joint overlap and pivots are unverified"]}
        html.append(f"<section><h2>{hero}</h2><small>{len(rows)} semantic classes · not approved for animation</small><p><img src='{hero}/review-sheet.png'></p><p><img src='{hero}/overlay.png'></p></section>")
    (OUT/"report.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (OUT/"index.html").write_text("\n".join(html)+"\n",encoding="utf-8")
    print(json.dumps({"heroes":{k:v["part_count"] for k,v in summary["heroes"].items()},
                      "errors":summary["errors"],"production_ready":False},ensure_ascii=False,indent=2))
    if summary["errors"]: raise SystemExit(1)

if __name__=="__main__": main()
