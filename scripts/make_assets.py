"""Derive web assets from the synagogue logo.

Usage: python scripts/make_assets.py "<path to logo png>"
Outputs into assets/: logo-512.png, logo-192.png, apple-touch-icon.png,
favicon-32.png and og-image.png (1200x630).
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ASSETS = Path(__file__).resolve().parent.parent / "assets"
OG_SIZE = (1200, 630)
OG_TOP = (30, 58, 138)
OG_BOTTOM = (59, 95, 196)
LOGO_SIZES = {"logo-512.png": 512, "logo-192.png": 192, "apple-touch-icon.png": 180, "favicon-32.png": 32}
FONT_CANDIDATES = ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
TITLE_LINE_1 = "רשימת הנזכרים"
TITLE_LINE_2 = "ליום הכיפורים תשפ\"ז"
SUBTITLE = "בית כנסת בית הרמב\"ם - מודיעין"


def cropped_logo(path: str) -> Image.Image:
    img = Image.open(path).convert("RGBA")
    return img.crop(img.getbbox())


def square(img: Image.Image, size: int) -> Image.Image:
    side = max(img.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def gradient(size, top, bottom) -> Image.Image:
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(size[1]):
        t = y / size[1]
        color = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        draw.line([(0, y), (size[0], y)], fill=color)
    return img


def load_font(size: int):
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def shaped(text: str) -> str:
    """Reverse Hebrew for Pillow (no bidi engine); keep quote marks in place."""
    return text[::-1]


def og_image(logo: Image.Image) -> Image.Image:
    bg = gradient(OG_SIZE, OG_TOP, OG_BOTTOM).convert("RGBA")
    badge = square(logo, 340)
    bg.alpha_composite(badge, (OG_SIZE[0] - 340 - 90, (OG_SIZE[1] - 340) // 2))
    draw = ImageDraw.Draw(bg)
    right = OG_SIZE[0] - 340 - 150
    draw.text((right, 150), shaped("לעילוי נשמת יקירינו"), font=load_font(30), fill=(190, 204, 240), anchor="ra")
    draw.text((right, 205), shaped(TITLE_LINE_1), font=load_font(60), fill="white", anchor="ra")
    draw.text((right, 285), shaped(TITLE_LINE_2), font=load_font(60), fill="white", anchor="ra")
    draw.text((right, 385), shaped(SUBTITLE), font=load_font(38), fill=(220, 228, 250), anchor="ra")
    return bg.convert("RGB")


def main(logo_path: str):
    ASSETS.mkdir(parents=True, exist_ok=True)
    logo = cropped_logo(logo_path)
    for name, size in LOGO_SIZES.items():
        square(logo, size).save(ASSETS / name, optimize=True)
    og_image(logo).save(ASSETS / "og-image.png", optimize=True)
    for file in sorted(ASSETS.iterdir()):
        print(file.name, file.stat().st_size)


if __name__ == "__main__":
    main(sys.argv[1])
