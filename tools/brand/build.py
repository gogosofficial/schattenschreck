#!/usr/bin/env python3
"""Erzeugt alle Logo- und Favicon-Dateien aus den Original-PNGs in tools/brand/quellen/.

Aufruf (aus dem Repo-Root):
    pip install potracer pillow numpy
    python3 tools/brand/build.py

Ausgabe: public/images/brand/ (Logos) und public/ (Favicons, Manifest).
"""
from pathlib import Path

import numpy as np
import potrace
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "tools/brand/quellen"
OUT = ROOT / "public/images/brand"
PUB = ROOT / "public"

BG = (12, 10, 11)       # #0c0a0b  Hintergrund
RED = (150, 18, 28)     # #96121c  Schrift/Signet
WHITE = (230, 230, 230)  # #e6e6e6  "HORROR"
HEX = {"bg": "#0c0a0b", "red": "#96121c", "white": "#e6e6e6"}

LOGOS = ["logo-quer", "logo-quadrat", "signet-s", "signet-s-horror"]
PAD = 0.04  # Rand um den Inhalt bei freigestellten Varianten (Anteil der Höhe)


def layers(img):
    a = np.asarray(img.convert("RGB")).astype(float)
    g = a[..., 1]
    r = a[..., 0]
    w = np.clip((g - BG[1]) / (WHITE[1] - BG[1]), 0, 1)
    rd = np.clip((r - BG[0] - w * (WHITE[0] - BG[0])) / (RED[0] - BG[0]), 0, 1)
    return rd, w


def bbox(mask, pad):
    ys, xs = np.where(mask > 0.5)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    p = int(round((y1 - y0) * pad))
    h, w = mask.shape
    return max(0, x0 - p), max(0, y0 - p), min(w, x1 + p), min(h, y1 + p)


def transparent_png(rd, w):
    h, wd = rd.shape
    out = np.zeros((h, wd, 4), dtype=np.uint8)
    is_white = w > rd
    for i, c in enumerate(RED):
        out[..., i] = c
    for i, c in enumerate(WHITE):
        out[..., i][is_white] = c
    out[..., 3] = (np.maximum(rd, w) * 255).round().astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def trace(mask, ox, oy):
    bm = potrace.Bitmap(mask <= 0.5)  # potracer zeichnet die "False"-Pixel
    plist = bm.trace(turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.2)
    f = lambda p: f"{p.x - ox:.1f} {p.y - oy:.1f}"
    d = []
    for curve in plist:
        d.append(f"M{f(curve.start_point)}")
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{f(seg.c)}L{f(seg.end_point)}")
            else:
                d.append(f"C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}")
        d.append("Z")
    return "".join(d)


def svg(rd, w, box, title, background=False):
    x0, y0, x1, y1 = box
    vw, vh = x1 - x0, y1 - y0
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" '
        f'width="{vw}" height="{vh}" role="img" aria-label="{title}">',
        f"<title>{title}</title>",
    ]
    if background:
        parts.append(f'<rect width="{vw}" height="{vh}" fill="{HEX["bg"]}"/>')
    for mask, col in ((rd, HEX["red"]), (w, HEX["white"])):
        if (mask > 0.5).any():
            parts.append(f'<path fill="{col}" fill-rule="evenodd" d="{trace(mask, x0, y0)}"/>')
    parts.append("</svg>\n")
    return "".join(parts)


def save_png(img, path):
    img.save(path, optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name in LOGOS:
        src = Image.open(SRC / f"{name}.png").convert("RGB")
        rd, w = layers(src)
        full = (0, 0, src.width, src.height)
        box = bbox(np.maximum(rd, w), PAD)
        title = "Schattenschreck Horror" if "horror" in name or "logo" in name else "Schattenschreck"

        save_png(src, OUT / f"{name}-dunkel.png")
        save_png(transparent_png(rd, w).crop(box), OUT / f"{name}.png")
        (OUT / f"{name}.svg").write_text(svg(rd, w, box, title))
        (OUT / f"{name}-dunkel.svg").write_text(svg(rd, w, full, title, background=True))
        print(name, "ok", box)

    # Altes /images/logo.png (wird evtl. extern verlinkt) aus dem neuen Logo erzeugen
    quer = Image.open(OUT / "logo-quer.png")
    save_png(quer.resize((970, round(970 * quer.height / quer.width)), Image.LANCZOS), ROOT / "public/images/logo.png")

    # Favicons aus dem S-Signet
    s0 = Image.open(SRC / "signet-s.png").convert("RGB")
    rd, w = layers(s0)
    m = s0.width  # Rand in Hintergrundfarbe, damit große Ausschnitte nicht schwarz werden
    s = Image.new("RGB", (s0.width + 2 * m, s0.height + 2 * m), BG)
    s.paste(s0, (m, m))
    x0, y0, x1, y1 = bbox(rd, 0)
    cx, cy, side = (x0 + x1) / 2 + m, (y0 + y1) / 2 + m, (y1 - y0)

    def square(scale):
        half = side * scale / 2
        return s.crop((int(cx - half), int(cy - half), int(cx + half), int(cy + half)))

    tight = square(1.12)   # kleine Icons: S möglichst groß
    roomy = square(1.45)   # Touch-Icons / maskable: Sicherheitsrand
    for size in (16, 32, 48):
        save_png(tight.resize((size, size), Image.LANCZOS), PUB / f"favicon-{size}.png")
    save_png(tight.resize((48, 48), Image.LANCZOS), PUB / "favicon.png")
    tight.resize((256, 256), Image.LANCZOS).save(PUB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    save_png(roomy.resize((180, 180), Image.LANCZOS), PUB / "apple-touch-icon.png")
    save_png(roomy.resize((192, 192), Image.LANCZOS), PUB / "icon-192.png")
    save_png(roomy.resize((512, 512), Image.LANCZOS), PUB / "icon-512.png")
    save_png(square(1.9).resize((512, 512), Image.LANCZOS), PUB / "icon-maskable-512.png")

    # favicon.svg: S auf dunklem, abgerundetem Quadrat
    half = side * 1.12 / 2
    fx0, fy0 = cx - m - half, cy - m - half
    path = trace(rd, fx0, fy0)
    vb = round(side * 1.12)
    (PUB / "favicon.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb} {vb}">'
        f'<rect width="{vb}" height="{vb}" rx="{round(vb * 0.18)}" fill="{HEX["bg"]}"/>'
        f'<path fill="{HEX["red"]}" fill-rule="evenodd" d="{path}"/></svg>\n'
    )
    print("favicons ok")


if __name__ == "__main__":
    main()
