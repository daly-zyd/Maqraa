"""Adapter: read the legacy Google-Sheets planning grids (xlsx) into plain rows.

Layout (both sheets): day names in a header row; two time columns headed 'تونس' / 'مكة'; a label column
with 'المصحح' (corrector) rows followed by 'المشرف' (supervisor) rows. A name cell may carry a start
override such as 'ش/أحمد بن عياد (05:30)'. Pure module: no Django, no app imports.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime, time, timedelta
from pathlib import Path

import openpyxl

_DAY_WEEKDAY = {"الاثنين": 0, "الثلاثاء": 1, "الاربعاء": 2, "الخميس": 3, "الجمعه": 4, "السبت": 5, "الاحد": 6}
_TRANS = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ة": "ه", "ى": "ي"})
_OVERRIDE = re.compile(r"\((\d{1,2}):(\d{2})\)")
SLOT_MINUTES = 60


def _norm(text) -> str:
    return " ".join(unicodedata.normalize("NFKC", str(text or "")).translate(_TRANS).split())


@dataclass
class SlotRow:
    weekday: int
    start: time
    end: time
    corrector: str
    supervisor: str | None
    cell: str  # e.g. "Feuil1!D17" for traceability


@dataclass
class ParsedPlanning:
    sheet: str
    title: str = ""
    maqraa_slug_hint: str = ""
    week_date: datetime | None = None
    slots: list[SlotRow] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def _add_minutes(t: time, minutes: int) -> time:
    return (datetime(2000, 1, 1, t.hour, t.minute) + timedelta(minutes=minutes)).time()


def _hint(title: str) -> str:
    t = _norm(title)
    riwaya = "qaloun" if "قالون" in t else "hafs" if "حفص" in t else ""
    gender = "women" if "نساء" in t else "men" if "رجال" in t else ""
    return f"{riwaya}-{gender}" if riwaya and gender else ""


def list_sheets(path: str | Path) -> list[str]:
    return openpyxl.load_workbook(path, read_only=True).sheetnames


def parse_workbook(path: str | Path, sheet: str | None = None) -> ParsedPlanning:
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb[sheet] if sheet else wb.worksheets[0]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    out = ParsedPlanning(sheet=ws.title)

    day_cols: dict[int, int] = {}
    tunis_col = mecca_col = header_row = None
    for ri, row in enumerate(rows):
        found = {ci: _DAY_WEEKDAY[_norm(v)] for ci, v in enumerate(row) if _norm(v) in _DAY_WEEKDAY}
        if len(found) >= 5:
            header_row, day_cols = ri, found
            for ci, v in enumerate(row):
                if _norm(v) == "تونس":
                    tunis_col = ci
                elif _norm(v) == "مكه":
                    mecca_col = ci
            break
    if header_row is None or tunis_col is None or mecca_col is None:
        raise ValueError("Planning layout not recognised (day header / تونس / مكة columns missing)")

    for row in rows[: header_row + 1]:
        for v in row:
            if isinstance(v, str) and "مقرا" in _norm(v) and "نحيا" in _norm(v):
                out.title = v.strip()
            if isinstance(v, datetime) and out.week_date is None:
                out.week_date = v
    out.maqraa_slug_hint = _hint(out.title)

    for ri in range(header_row + 1, len(rows)):
        row = rows[ri]
        label_idx = next((ci for ci, v in enumerate(row) if _norm(v) == "المصحح"), None)
        if label_idx is None:
            continue
        t_tunis, t_mecca = row[tunis_col], row[mecca_col]
        if not isinstance(t_tunis, time) or not isinstance(t_mecca, time):
            continue
        start_row = t_tunis
        expected_mecca = _add_minutes(t_tunis, 120)
        if expected_mecca != t_mecca:
            start_row = _add_minutes(t_mecca, -120)  # the Mecca column is the consistent one in the sheets
            out.warnings.append(
                f"row {ri + 1}: Tunis {t_tunis:%H:%M} / Mecca {t_mecca:%H:%M} inconsistent; "
                f"using Mecca-2h = {start_row:%H:%M}")
        sup_row = rows[ri + 1] if ri + 1 < len(rows) else []
        for ci, weekday in day_cols.items():
            raw = row[ci] if ci < len(row) else None
            if raw is None or not str(raw).strip():
                continue
            raw = str(raw)
            start = start_row
            m = _OVERRIDE.search(raw)
            if m:
                start = time(int(m.group(1)), int(m.group(2)))
                out.warnings.append(
                    f"{ws.title}!R{ri + 1}C{ci + 1}: start override {start:%H:%M}; duration assumed {SLOT_MINUTES} min")
            sup_raw = sup_row[ci] if ci < len(sup_row) else None
            sup = str(sup_raw).strip() if sup_raw is not None and str(sup_raw).strip() else None
            out.slots.append(SlotRow(weekday=weekday, start=start, end=_add_minutes(start, SLOT_MINUTES),
                                     corrector=raw.strip(), supervisor=sup, cell=f"{ws.title}!R{ri + 1}C{ci + 1}"))
    return out
