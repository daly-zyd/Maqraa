"""Query budgets per endpoint (section 2B.2): no N+1, bounded work regardless of data size."""
from datetime import time, timedelta

from django.utils import timezone

from apps.core import timeutil
from apps.scheduling import services


def _populate(make_user, maq, admin, n):
    q = maq["qaloun-men"]
    sheikhs = [make_user(f"s{i}", roles={"qaloun-men": ["sheikh"]}) for i in range(n)]
    tomorrow = (timezone.now().astimezone(timeutil.TUNIS) + timedelta(days=1)).date()
    for i, s in enumerate(sheikhs):
        services.create_slot(admin, q.pk, weekday=tomorrow.weekday(), start=time(i, 0), end=time(i, 45), sheikh_id=s.person_id)
    return q, tomorrow


def _count(client_for, user, url, django_assert_max_num_queries, budget):
    with django_assert_max_num_queries(budget):
        r = client_for(user).get(url)
    assert r.status_code == 200
    return r


def test_today_board_and_slot_list_do_not_grow_with_rows(make_user, maq, client_for, django_assert_max_num_queries):
    admin = make_user("adm", roles={"qaloun-men": ["admin"]})
    q, tomorrow = _populate(make_user, maq, admin, 12)
    r = _count(client_for, admin, f"/api/v1/maqraat/{q.pk}/today/?date={tomorrow}", django_assert_max_num_queries, 8)
    assert len(r.json()["sessions"]) == 12
    r = _count(client_for, admin, f"/api/v1/maqraat/{q.pk}/slots/", django_assert_max_num_queries, 6)
    assert len(r.json()) == 12
    _count(client_for, admin, f"/api/v1/maqraat/{q.pk}/sessions/?from={tomorrow}&to={tomorrow}", django_assert_max_num_queries, 6)


def test_me_people_and_maqraat_budgets(make_user, maq, client_for, django_assert_max_num_queries):
    admin = make_user("adm", roles={"qaloun-men": ["admin"], "hafs-men": ["sheikh"]})
    _populate(make_user, maq, admin, 8)
    q = maq["qaloun-men"].pk
    _count(client_for, admin, "/api/v1/me/", django_assert_max_num_queries, 8)
    _count(client_for, admin, f"/api/v1/people/?maqraa={q}", django_assert_max_num_queries, 5)
    _count(client_for, admin, "/api/v1/maqraat/", django_assert_max_num_queries, 4)
