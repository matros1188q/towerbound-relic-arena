from PIL import Image
from pathlib import Path
from urllib.request import Request, urlopen
from io import BytesIO

URL = "https://d2ol7oe51mr4n9.cloudfront.net/user_3JJbyBNV18d7ADzwAWtUl75eRYE/13fae98f-1815-4d94-b088-04c2fc11136e.png"
req = Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urlopen(req, timeout=45) as response:
    raw = response.read()
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
"thorncrown":(0,0),"sunshard":(1,0),"warbanner":(2,0),"mimicseal":(3,0),"icebrand":(4,0),
"permafrost":(0,1),"runebinder":(1,1),"astralcompass":(2,1),"goldenacorn":(3,1),"pilgrimseal":(4,1),
"abyssalheart":(0,2),"bloodfang":(1,2),"bulwark":(2,2),"dawnblade":(3,2)}
cw, ch = im.width / cols, im.height / rows
for name, (cx, cy) in ids.items():
    left, top = round(cx*cw), round(cy*ch)
    right, bottom = round((cx+1)*cw), round((cy+1)*ch)
    mx, my = round((right-left)*0.035), round((bottom-top)*0.035)
    crop = im.crop((left+mx, top+my, right-mx, bottom-my))
    crop.save(out / f"{name}.png", optimize=True)
print(f"Generated {len(ids)} independent relic images from {im.size} atlas.")
