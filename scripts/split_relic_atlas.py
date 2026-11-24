from PIL import Image
from pathlib import Path
from urllib.request import Request, urlopen
from io import BytesIO

URL = "https://d2ol7oe51mr4n9.cloudfront.net/user_3JJbyBNV18d7ADzwAWtUl75eRYE/13fae98f-1815-4d94-b088-04c2fc11136e.png"
req = Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urlopen(req, timeout=45) as response:
    raw = response.read()
im = Image.open(BytesIO(raw)).convert("RGBA")
# Keep a temporary copy of the exact original atlas in the repo so crop geometry can be inspected.
Path("assets/relics").mkdir(parents=True, exist_ok=True)
im.thumbnail((900, 900))
im.convert("RGB").save("assets/relics/_source-atlas-preview.jpg", quality=60, optimize=True)
# Reopen full-resolution original for actual crops below.
im = Image.open(BytesIO(raw)).convert("RGBA")
if im.width < 500 or im.height < 700:
    raise RuntimeError(f"Unexpected atlas size: {im.size}")
# Original atlas is laid out as 5 columns x 7 rows. Crop the interior of each
# cell, removing the outer 3.5% to avoid any artwork from neighboring cells.
cols, rows = 5, 7
out = Path("assets/relics")
out.mkdir(parents=True, exist_ok=True)
ids = {
"ember":(0,0),"frost":(1,0),"thorn":(2,0),"spark":(3,0),"moon":(4,0),
"rune":(0,1),"void":(1,1),"phoenix":(2,1),"crown":(3,1),"fang":(4,1),
"heart":(0,2),"hourglass":(1,2),"meteor":(2,2),"mirror":(3,2),"oracle":(4,2),
"multishot":(0,3),"venom":(1,3),"cinder":(2,3),"swift":(3,3),"quiver":(4,3),
"stormglass":(0,4),"bloodpact":(1,4),"soulchain":(2,4),"ironbark":(3,4),"starfall":(4,4),
"echo":(0,5),"luckycoin":(1,5),"laststand":(2,5),"glacier":(3,5),"plague":(4,5),
"bloodmoon":(0,6),"guardian":(1,6),"soulharvest":(2,6),"wildfire":(3,6),"riftsigil":(4,6),
}
# These IDs were incorrectly mapped to already-used atlas cells in an earlier version.
# The game now renders dedicated, name-specific vector art for them; remove stale duplicated PNGs.
reused_ids = {
    "thorncrown", "sunshard", "warbanner", "mimicseal", "icebrand",
    "permafrost", "runebinder", "astralcompass", "goldenacorn", "pilgrimseal",
    "abyssalheart", "bloodfang", "bulwark", "dawnblade",
}
for name in reused_ids:
    stale = out / f"{name}.png"
    if stale.exists():
        stale.unlink()

cw, ch = im.width / cols, im.height / rows
for name, (cx, cy) in ids.items():
    left, top = round(cx*cw), round(cy*ch)
    right, bottom = round((cx+1)*cw), round((cy+1)*ch)
    mx, my = round((right-left)*0.035), round((bottom-top)*0.035)
    # The atlas has two vertically touching illustrations in column 4:
    # the glacier crystal in row 6 and the wildfire/flame in row 7. The
    # crystal's glow overlaps the nominal grid boundary, so a uniform cell
    # crop accidentally includes the top of the flame. Clip glacier to the
    # visible crystal region and pad onto a square canvas instead of stretching.
    if name == "glacier":
        crop_bottom = top + round(ch * 0.79)
        crop = im.crop((left+mx, top+my, right-mx, crop_bottom))
        # Keep the source's dark background and preserve proportions.
        side = max(crop.width, crop.height)
        square = Image.new("RGBA", (side, side), (4, 10, 24, 255))
        square.alpha_composite(crop, ((side-crop.width)//2, 0))
        crop = square
    else:
        crop = im.crop((left+mx, top+my, right-mx, bottom-my))
    crop.save(out / f"{name}.png", optimize=True)
print(f"Generated {len(ids)} independent relic images from {im.size} atlas.")
