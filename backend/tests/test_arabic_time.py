from datetime import date, datetime, time

from apps.core import timeutil
from apps.core.arabic import name_key, normalize_arabic


def test_aliases_resolve_to_one_key():
    assert name_key("ش/ يوسف المديحي") == name_key("يوسف مديحي")
    assert name_key("ش/أحمد بن عياد (05:30)") == name_key("احمد بن عياد")
    assert name_key("ش/ فؤاد حسان ") == name_key("فؤاد  حسان")
    assert normalize_arabic("الإربعاء") == "الاربعاء"


def test_tunis_mecca_offset_and_midnight_crossing():
    start, end = timeutil.slot_to_utc(date(2026, 10, 20), time(23, 0), time(0, 0))
    assert end - start == (end - start).__class__(hours=1)
    assert end.date() == date(2026, 10, 20) or end.hour == 23  # 00:00 Tunis next day = 23:00 UTC
    assert timeutil.fmt_hm(start, timeutil.TUNIS) == "23:00"
    assert timeutil.fmt_hm(start, timeutil.MECCA) == "01:00"  # Mecca = Tunis + 2h
    assert timeutil.fmt_hm(end, timeutil.MECCA) == "02:00"


def test_slot_crossing_midnight_ends_next_day():
    start, end = timeutil.slot_to_utc(date(2026, 3, 28), time(23, 30), time(0, 30))
    assert (end - start).total_seconds() == 3600
    assert end.astimezone(timeutil.TUNIS).day == 29


def test_arabic_dates():
    assert timeutil.date_ar(date(2026, 10, 20)) == "الثلاثاء 20 أكتوبر 2026"
    assert "هـ" in timeutil.date_hijri_ar(date(2026, 10, 20))
    assert isinstance(timeutil.local_to_utc(date(2026, 10, 20), time(1, 0)), datetime)
