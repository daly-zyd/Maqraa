"""Generate the maqraa logos (SVG with text outlined + transparent PNG).

    python scripts/logos/build_logos.py            # writes public/brand/logo-<slug>.svg|png

Text is shaped with HarfBuzz and converted to vector outlines, so the SVG needs no font and renders
identically everywhere. Fonts are open (SIL OFL): Aref Ruqaa, Amiri, Reem Kufi.
Palette, labels and year are data (PALETTES / LOGOS) - add a maqraa by adding a line.
"""
from __future__ import annotations

import math
import sys
from dataclasses import dataclass
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
OUT = HERE.parent.parent / "public" / "brand"
YEAR = "2026-1448"
TITLE = "بِالْقُرْآنِ نَحْيَا"


@dataclass(frozen=True)
class Palette:
    disc_hi: str   # centre of the medallion
    disc_lo: str   # edge of the medallion
    ring: str      # ornament band background
    text: str      # title ink
    cover: str     # book cover leather
    page_tint: str # printed page frame tint
    medallion_ink: str


PALETTES = {
    "burgundy": Palette("#8a1f33", "#4a0b19", "#3a0814", "#7a1527", "#2c5a3e", "#e6efdd", "#1d3f94"),
    "emerald": Palette("#1f6b46", "#0b3624", "#08291b", "#1b2f6b", "#1f4a33", "#e6efdd", "#1d3f94"),
    "plum": Palette("#7b2a5a", "#3e0f2e", "#2f0a23", "#6a1f4c", "#2c5a3e", "#f0e6ef", "#1d3f94"),
    "teal": Palette("#15717a", "#07363c", "#052a2f", "#14465c", "#1f4f4a", "#e2f0ee", "#1d3f94"),
}
# slug -> (palette, subtitle)
LOGOS = {
    "hafs-men": ("burgundy", "مقرأة حفص رجال"),
    "hafs-women": ("plum", "مقرأة حفص نساء"),
    "qaloun-men": ("emerald", "مقرأة قالون رجال"),
    "qaloun-women": ("teal", "مقرأة قالون نساء"),
    "brand": ("emerald", "مقرأة قرآنية"),
}


class Face:
    def __init__(self, name: str):
        path = str(HERE / "fonts" / name)
        self.hb_font = hb.Font(hb.Face(hb.Blob.from_file_path(path)))
        self.tt = TTFont(path)
        self.glyphs = self.tt.getGlyphSet()
        self.upem = self.tt["head"].unitsPerEm

    def outline(self, text: str, size: float, cx: float, baseline: float, *, max_width: float | None = None):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb_font, buf, {"kern": True, "liga": True, "mark": True, "mkmk": True})
        scale = size / self.upem
        width = sum(p.x_advance for p in buf.glyph_positions) * scale
        if max_width and width > max_width:
            scale *= max_width / width
            width = max_width
        x = cx - width / 2
        pen = SVGPathPen(self.glyphs)
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            tp = TransformPen(pen, (scale, 0, 0, -scale, x + pos.x_offset * scale, baseline - pos.y_offset * scale))
            self.glyphs[self.tt.getGlyphName(info.codepoint)].draw(tp)
            x += pos.x_advance * scale
        return pen.getCommands()


def star(cx: float, cy: float, r: float, rot: float = 0.0, inner: float = 0.62) -> str:
    pts = []
    for i in range(16):
        ang = math.radians(rot + i * 22.5 - 90)
        rad = r if i % 2 == 0 else r * inner
        pts.append(f"{cx + rad * math.cos(ang):.1f},{cy + rad * math.sin(ang):.1f}")
    return "M" + " L".join(pts) + "Z"


def ornament_ring(cx, cy, radius, count=28) -> str:
    out = []
    for i in range(count):
        a = math.radians(i * 360 / count)
        x, y = cx + radius * math.cos(a), cy + radius * math.sin(a)
        out.append(f'<path d="{star(x, y, 19, i * 360 / count)}" fill="url(#gold)" stroke="#6b4a0c" stroke-width=".8"/>')
        b = math.radians((i + .5) * 360 / count)
        out.append(f'<circle cx="{cx + radius * math.cos(b):.1f}" cy="{cy + radius * math.sin(b):.1f}" r="4.2" fill="#f1d98c" opacity=".9"/>')
    return "".join(out)


def rosette(cx, cy, r) -> str:
    out = []
    for i in range(16):
        out.append(f'<ellipse cx="{cx}" cy="{cy - r / 2}" rx="{r * .16}" ry="{r / 2}" transform="rotate({i * 22.5} {cx} {cy})" '
                   f'fill="none" stroke="#f1d98c" stroke-width="1.4" opacity=".16"/>')
    for k in (.55, .8):
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r * k}" fill="none" stroke="#f1d98c" stroke-width="1.2" opacity=".14"/>')
    return "".join(out)


def page_group(p: Palette, label_path_main: str, label_path_sub: str) -> str:
    """Right-hand page in local coordinates (spine at x=0). Mirrored for the left page."""
    face = "M0,12 C85,-18 205,-44 292,-50 L292,148 C205,150 85,170 0,206 Z"
    return f'''
  <path d="M0,206 C85,170 205,150 292,148 L292,176 C205,178 85,200 0,238 Z" fill="#f7efd8" stroke="#8a5f12" stroke-width="2"/>
  <g stroke="#b9892a" stroke-width="1.2" opacity=".85" fill="none">
    <path d="M0,212 C85,176 205,156 292,154"/><path d="M0,219 C85,183 205,163 292,160"/>
    <path d="M0,226 C85,190 205,170 292,167"/><path d="M0,232 C85,196 205,177 292,173"/>
  </g>
  <path d="{face}" fill="url(#paper)" stroke="#8a5f12" stroke-width="3"/>
  <path d="M14,30 C90,6 200,-14 276,-22 L276,134 C200,138 90,156 14,184 Z" fill="{p.page_tint}" stroke="url(#gold)" stroke-width="5"/>
  <path d="M24,38 C96,16 200,-2 266,-9 L266,126 C200,130 96,146 24,172 Z" fill="none" stroke="#2d7a52" stroke-width="2.2"/>
  <ellipse cx="150" cy="78" rx="86" ry="68" fill="#fbf6e6" stroke="url(#gold)" stroke-width="5"/>
  <ellipse cx="150" cy="78" rx="76" ry="58" fill="none" stroke="#2d7a52" stroke-width="2"/>
  <path d="{label_path_main}" fill="{p.medallion_ink}"/><path d="{label_path_sub}" fill="{p.medallion_ink}"/>
'''


def cover(color: str) -> str:
    """Leather cover rim around the right-hand page (mirrored for the left one)."""
    return ('<path d="M0,-2 C85,-32 205,-58 310,-68 L310,198 C205,196 85,220 0,262 Z" fill="' + color + '" '
            'stroke="#10241a" stroke-width="3"/>'
            '<path d="M6,6 C88,-22 205,-46 300,-56 L300,190 C205,188 88,210 6,250" fill="none" stroke="url(#gold)" '
            'stroke-width="3.5"/>')


def rehal() -> str:
    plank = '''<rect x="-190" y="-20" width="380" height="44" rx="20" fill="url(#wood)" stroke="#3b2208" stroke-width="3"/>
    <rect x="-176" y="-9" width="352" height="8" rx="4" fill="none" stroke="#e9c36a" stroke-width="2.2" opacity=".85"/>
    <g fill="#e9c36a" opacity=".9">''' + "".join(f'<circle cx="{x}" cy="9" r="3.6"/>' for x in range(-150, 151, 50)) + "</g>"
    return f'<g transform="translate(0,262)"><g transform="rotate(24)">{plank}</g><g transform="rotate(-24)">{plank}</g></g>'


def build(slug: str, palette_name: str, subtitle: str, faces: dict) -> str:
    p = PALETTES[palette_name]
    title_d = faces["title"].outline(TITLE, 190, 500, 268, max_width=600)
    sub_d = faces["sub"].outline(subtitle, 68, 500, 806, max_width=520)
    year_d = faces["year"].outline(YEAR, 50, 500, 884, max_width=250)
    q1 = faces["sub"].outline("القرآن", 44, 150, 82, max_width=120)
    q2 = faces["sub"].outline("الكريم", 36, 150, 118, max_width=100)
    q1L = faces["sub"].outline("القرآن", 44, -150, 82, max_width=120)
    q2L = faces["sub"].outline("الكريم", 36, -150, 118, max_width=100)
    cx, cy = 500, 560
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000" role="img" aria-label="{subtitle} - بالقرآن نحيا">
<title>{subtitle} - بالقرآن نحيا</title>
<defs>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e7a8"/><stop offset=".35" stop-color="#d5a536"/><stop offset=".7" stop-color="#8f6313"/><stop offset="1" stop-color="#ecc968"/></linearGradient>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dfc2"/><stop offset=".25" stop-color="#fbf5e1"/><stop offset="1" stop-color="#f3e9cb"/></linearGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9763a"/><stop offset=".5" stop-color="#8a5122"/><stop offset="1" stop-color="#5b3314"/></linearGradient>
  <linearGradient id="ribbon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4cf"/><stop offset="1" stop-color="#e5c97e"/></linearGradient>
  <radialGradient id="disc" cx=".5" cy=".42" r=".65"><stop offset="0" stop-color="{p.disc_hi}"/><stop offset="1" stop-color="{p.disc_lo}"/></radialGradient>
  <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#000" flood-opacity=".4"/></filter>
  <filter id="soft" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".35"/></filter>
</defs>
<g filter="url(#shadow)">
  <circle cx="{cx}" cy="{cy}" r="446" fill="url(#gold)"/>
  <circle cx="{cx}" cy="{cy}" r="432" fill="#fff1c4" opacity=".35"/>
  <circle cx="{cx}" cy="{cy}" r="424" fill="{p.ring}" stroke="#6b4a0c" stroke-width="2"/>
</g>
<circle cx="{cx}" cy="{cy}" r="412" fill="none" stroke="url(#gold)" stroke-width="3"/>
{ornament_ring(cx, cy, 388)}
<circle cx="{cx}" cy="{cy}" r="362" fill="none" stroke="url(#gold)" stroke-width="8"/>
<circle cx="{cx}" cy="{cy}" r="352" fill="url(#disc)"/>
<circle cx="{cx}" cy="{cy}" r="352" fill="none" stroke="#f1d98c" stroke-width="1.5" opacity=".6"/>
{rosette(cx, cy, 340)}
<g transform="translate(500,446) scale(.87)" filter="url(#soft)">
  {rehal()}
  <g id="cover">{cover(p.cover)}<g transform="scale(-1,1)">{cover(p.cover)}</g></g>
  <g>{page_group(p, q1, q2)}</g>
  <g transform="scale(-1,1)">{page_group(p, "", "")}</g>
  <path d="{q1L}" fill="{p.medallion_ink}"/><path d="{q2L}" fill="{p.medallion_ink}"/>
  <path d="M0,12 L0,238" stroke="#7c5a1a" stroke-width="3"/>
</g>
<g filter="url(#soft)"><path d="{sub_d}" fill="#f6e3a0" stroke="#5a3d08" stroke-width="1.2" stroke-linejoin="round"/></g>
<g filter="url(#soft)">
  <path d="M258,818 L742,818 L742,906 L258,906 Z" fill="url(#ribbon)" stroke="#8a5f12" stroke-width="3"/>
  <path d="M258,830 L190,830 L224,862 L190,894 L258,894 Z" fill="#d9b75f" stroke="#8a5f12" stroke-width="3"/>
  <path d="M742,830 L810,830 L776,862 L810,894 L742,894 Z" fill="#d9b75f" stroke="#8a5f12" stroke-width="3"/>
  <path d="M258,818 L258,894 L282,906 L258,906 Z M742,818 L742,894 L718,906 L742,906 Z" fill="#a98225" opacity=".55"/>
</g>
<path d="{year_d}" fill="{p.text}"/>
<g filter="url(#shadow)">
  <path d="{title_d}" fill="#8a5f12" stroke="#8a5f12" stroke-width="46" stroke-linejoin="round"/>
  <path d="{title_d}" fill="#fff6dc" stroke="#fff6dc" stroke-width="32" stroke-linejoin="round"/>
</g>
<path d="{title_d}" fill="{p.text}"/>
</svg>
'''


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    faces = {"title": Face("ArefRuqaa-Bold.ttf"), "sub": Face("Amiri-Bold.ttf"), "year": Face("Amiri-Latin-Bold.ttf")}
    for slug, (pal, sub) in LOGOS.items():
        (OUT / f"logo-{slug}.svg").write_text(build(slug, pal, sub, faces), encoding="utf-8")
        print("wrote", OUT / f"logo-{slug}.svg")


if __name__ == "__main__":
    sys.exit(main())
