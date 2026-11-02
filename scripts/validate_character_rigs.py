#!/usr/bin/env python3
"""Validate Towerbound character source art and cutout-rig manifests (stdlib only)."""
from __future__ import annotations
import argparse, json, struct, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = ("heroes", "enemies", "bosses")
REQUIRED_CLIPS = {"idle", "attack", "hit"}

def load_json(path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def png_info(path):
    with path.open("rb") as f:
        header = f.read(26)
    if len(header) < 26 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError("not a valid PNG/IHDR")
    width, height, depth, color_type = struct.unpack(">IIBB", header[16:26])
    return width, height, depth, color_type

def validate_rig(path, expected_id, expected_image, errors):
    rig = load_json(path)
    if rig.get("schema_version") != 1: errors.append(f"{path}: schema_version must be 1")
    if rig.get("character_id") != expected_id: errors.append(f"{path}: character_id mismatch")
    if rig.get("source_image") != expected_image: errors.append(f"{path}: source_image mismatch")
    canvas = rig.get("canvas", {})
    if not all(isinstance(canvas.get(k), int) and canvas[k] > 0 for k in ("width", "height")):
        errors.append(f"{path}: canvas width/height must be positive integers")
    parts = rig.get("parts", [])
    if not isinstance(parts, list) or not parts: errors.append(f"{path}: parts must be a non-empty array"); parts=[]
    part_ids=set()
    for part in parts:
        pid=part.get("id")
        if not isinstance(pid,str) or not pid: errors.append(f"{path}: part with missing id"); continue
        if pid in part_ids: errors.append(f"{path}: duplicate part id {pid}")
        part_ids.add(pid)
        pivot=part.get("pivot")
        if not isinstance(pivot,list) or len(pivot)!=2 or any(not isinstance(v,(int,float)) or not 0<=v<=1 for v in pivot):
            errors.append(f"{path}: part {pid} pivot must be normalized [x,y]")
        parent=part.get("parent")
        if parent is not None and parent not in {p.get("id") for p in parts}:
            errors.append(f"{path}: part {pid} references missing parent {parent}")
        image=part.get("image")
        if not isinstance(image,str) or not image.startswith("assets/characters/rigs/") or not image.endswith(".png"):
            errors.append(f"{path}: part {pid} image must be under assets/characters/rigs/")
        elif not (ROOT/image).is_file(): errors.append(f"{path}: missing part image {image}")
        if not isinstance(part.get("z_index"),int): errors.append(f"{path}: part {pid} z_index must be integer")
    if rig.get("root") not in part_ids: errors.append(f"{path}: root must reference an existing part")
    # Parent graph must be acyclic.
    parents={p.get("id"):p.get("parent") for p in parts if isinstance(p,dict)}
    for start in parents:
        seen=set(); node=start
        while node is not None and node in parents:
            if node in seen: errors.append(f"{path}: parent cycle involving {node}"); break
            seen.add(node); node=parents[node]
    clips=rig.get("clips", [])
    clip_ids=set()
    if not isinstance(clips,list): errors.append(f"{path}: clips must be an array"); clips=[]
    for clip in clips:
        cid=clip.get("id")
        if cid in clip_ids: errors.append(f"{path}: duplicate clip id {cid}")
        clip_ids.add(cid)
        duration=clip.get("duration_ms",0)
        for track in clip.get("tracks",[]):
            if track.get("part") not in part_ids: errors.append(f"{path}: clip {cid} targets unknown part {track.get('part')}")
            frames=track.get("keyframes",[])
            if len(frames)<2: errors.append(f"{path}: clip {cid} track {track.get('part')} needs >=2 keyframes")
            last=-1
            for frame in frames:
                at=frame.get("at_ms",-1)
                if not isinstance(at,int) or at<0 or at>duration or at<last: errors.append(f"{path}: clip {cid} has invalid keyframe time {at}")
                last=at
        for event in clip.get("events",[]):
            at=event.get("at_ms",-1)
            if not isinstance(at,int) or at<0 or at>duration: errors.append(f"{path}: clip {cid} event {event.get('id')} outside duration")
    if clips and not REQUIRED_CLIPS.issubset(clip_ids):
        errors.append(f"{path}: missing required clips {sorted(REQUIRED_CLIPS-clip_ids)}")
    return {"parts":len(parts),"clips":len(clips),"clip_ids":sorted(clip_ids)}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--strict",action="store_true",help="fail if any roster character has no rig manifest yet")
    parser.add_argument("--report",default="artifacts/character-rig-qa.json")
    args=parser.parse_args()
    errors=[]; roster=[]; pending=[]; completed=[]
    for category in CATEGORIES:
        manifest_path=ROOT/"assets"/"characters"/category/"manifest.json"
        if not manifest_path.is_file(): errors.append(f"missing manifest: {manifest_path}"); continue
        manifest=load_json(manifest_path)
        for asset in manifest.get("assets",[]):
            aid=asset.get("exact_asset_id"); rel=asset.get("relative_path")
            if not aid or not rel: errors.append(f"{manifest_path}: asset missing exact_asset_id/relative_path"); continue
            image=ROOT/rel
            if not image.is_file(): errors.append(f"{aid}: missing source image {rel}")
            else:
                try:
                    w,h,depth,color=png_info(image)
                    if w!=asset.get("width") or h!=asset.get("height"): errors.append(f"{aid}: manifest size mismatch, actual {w}x{h}")
                    if color not in (4,6): errors.append(f"{aid}: source PNG has no alpha channel (color type {color})")
                except Exception as exc: errors.append(f"{aid}: {exc}")
            rig_path=ROOT/"assets"/"characters"/"rigs"/category/(aid.split(".",1)[1]+".rig.json")
            row={"id":aid,"category":category,"source_image":rel,"rig_manifest":str(rig_path.relative_to(ROOT))}
            roster.append(row)
            if rig_path.is_file():
                try: row["rig"]=validate_rig(rig_path,aid,rel,errors); completed.append(aid)
                except Exception as exc: errors.append(f"{rig_path}: {exc}")
            else: pending.append(aid)
    report={"schema_version":1,"roster_count":len(roster),"source_art_valid":len(roster)-len(errors),"rigged_count":len(completed),"pending_rigs":pending,"errors":errors,"roster":roster}
    out=ROOT/args.report
    out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:report[k] for k in ("roster_count","rigged_count","pending_rigs","errors")},indent=2))
    if errors or (args.strict and pending): return 1
    return 0

if __name__=="__main__": sys.exit(main())
