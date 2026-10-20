"""Time handling (section 6): store UTC, display Tunis + Mecca, Arabic and Hijri dates."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from hijridate import Gregorian

TUNIS = ZoneInfo("Africa/Tunis")
MECCA = ZoneInfo("Asia/Riyadh")
UTC = ZoneInfo("UTC")

AR_WEEKDAYS = {0: "الإثنين", 1: "الثلاثاء", 2: "الأربعاء", 3: "الخميس", 4: "الجمعة", 5: "السبت", 6: "الأحد"}
AR_MONTHS = {
    1: "يناير", 2: "فبراير", 3: "مارس", 4: "أبريل", 5: "مايو", 6: "يونيو",
    7: "يوليو", 8: "أغسطس", 9: "سبتمبر", 10: "أكتوبر", 11: "نوفمبر", 12: "ديسمبر",
}
AR_HIJRI_MONTHS = {
    1: "محرم", 2: "صفر", 3: "ربيع الأول", 4: "ربيع الآخر", 5: "جمادى الأولى", 6: "جمادى الآخرة",
    7: "رجب", 8: "شعبان", 9: "رمضان", 10: "شوال", 11: "ذو القعدة", 12: "ذو الحجة",
}


def local_to_utc(day: date, at: time, tz: ZoneInfo = TUNIS) -> datetime:
    return datetime.combine(day, at, tzinfo=tz).astimezone(UTC)


def slot_to_utc(day: date, start: time, end: time, tz: ZoneInfo = TUNIS) -> tuple[datetime, datetime]:
    """A slot whose end is <= its start crosses midnight (late-night Tunis slots)."""
    start_local = datetime.combine(day, start, tzinfo=tz)
    end_day = day if end > start else day + timedelta(days=1)
    end_local = datetime.combine(end_day, end, tzinfo=tz)
    return start_local.astimezone(UTC), end_local.astimezone(UTC)


def fmt_hm(value: datetime, tz: ZoneInfo) -> str:
    return value.astimezone(tz).strftime("%H:%M")


def date_ar(day: date) -> str:
    return f"{AR_WEEKDAYS[day.weekday()]} {day.day} {AR_MONTHS[day.month]} {day.year}"


def date_hijri_ar(day: date, adjust_days: int = 0) -> str:
    h = Gregorian.fromdate(day + timedelta(days=adjust_days)).to_hijri()
    return f"{h.day} {AR_HIJRI_MONTHS[h.month]} {h.year} هـ"


def local_day_bounds_utc(day: date, tz: ZoneInfo = TUNIS) -> tuple[datetime, datetime]:
    start = datetime.combine(day, time(0, 0), tzinfo=tz).astimezone(UTC)
    return start, (datetime.combine(day + timedelta(days=1), time(0, 0), tzinfo=tz)).astimezone(UTC)
