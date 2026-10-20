import pytest

from apps.audit.models import AuditLog


def ids(maq):
    return {slug: m.pk for slug, m in maq.items()}


def test_maqraat_list_is_scoped(make_user, client_for, maq):
    user = make_user(roles={"qaloun-men": ["supervisor"]})
    data = client_for(user).get("/api/v1/maqraat/").json()
    assert [m["slug"] for m in data] == ["qaloun-men"]


def test_me_contract(make_user, client_for, maq):
    user = make_user(roles={"qaloun-men": ["admin"], "hafs-men": ["sheikh"]})
    me = client_for(user).get("/api/v1/me/").json()
    by_slug = {m["slug"]: m for m in me["maqraat"]}
    assert set(by_slug) == {"qaloun-men", "hafs-men"}
    assert "schedule.edit" in by_slug["qaloun-men"]["capabilities"]
    assert "schedule.edit" not in by_slug["hafs-men"]["capabilities"]
    assert me["global_capabilities"] == []


@pytest.mark.parametrize("url", [
    "/api/v1/maqraat/{hafs}/", "/api/v1/maqraat/{hafs}/links/", "/api/v1/maqraat/{hafs}/slots/",
    "/api/v1/maqraat/{hafs}/today/", "/api/v1/maqraat/{hafs}/sessions/", "/api/v1/people/?maqraa={hafs}",
    "/api/v1/settings/?maqraa={hafs}", "/api/v1/audit/?maqraa={hafs}",
])
def test_cross_scope_reads_return_404_and_are_audited(make_user, client_for, maq, url):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    r = client_for(admin).get(url.format(hafs=maq["hafs-men"].pk))
    assert r.status_code == 404, url
    assert AuditLog.objects.filter(actor_user_id=admin.pk, outcome="denied").exists() or "audit" in url


def test_cross_scope_writes_return_404(make_user, client_for, maq):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    c = client_for(admin)
    hafs = maq["hafs-men"].pk
    assert c.post(f"/api/v1/maqraat/{hafs}/slots/", {"weekday": 1, "start": "10:00", "end": "11:00"}, format="json").status_code == 404
    assert c.post(f"/api/v1/maqraat/{hafs}/generate-sessions/").status_code == 404
    assert c.post(f"/api/v1/maqraat/{hafs}/links/", {"kind": "zoom", "url": "https://zoom.us/j/1"}, format="json").status_code == 404
    assert c.post("/api/v1/settings/", {"key": "apology_after_start_minutes", "value": 5, "maqraa_id": hafs}, format="json").status_code == 404


def test_women_maqraa_invisible_to_men_team(make_user, client_for, maq):
    sup = make_user(roles={"hafs-men": ["supervisor"]})
    c = client_for(sup)
    assert c.get(f"/api/v1/maqraat/{maq['hafs-women'].pk}/today/").status_code == 404
    assert [m["slug"] for m in c.get("/api/v1/maqraat/").json()] == ["hafs-men"]


def test_missing_capability_in_scope_is_403(make_user, client_for, maq):
    sheikh = make_user(roles={"qaloun-men": ["sheikh"]})
    c = client_for(sheikh)
    q = maq["qaloun-men"].pk
    assert c.get(f"/api/v1/maqraat/{q}/slots/").status_code == 403
    assert c.post(f"/api/v1/maqraat/{q}/generate-sessions/").status_code == 403
    assert c.get(f"/api/v1/people/?maqraa={q}").status_code == 403
    assert c.get("/api/v1/audit/").status_code == 403
    assert c.get(f"/api/v1/maqraat/{q}/today/").status_code == 200


def test_unauthenticated_requests_are_rejected(client_for, maq):
    c = client_for(None)
    assert c.get("/api/v1/me/").status_code == 401
    assert c.get(f"/api/v1/maqraat/{maq['hafs-men'].pk}/today/").status_code == 401


def test_phones_only_for_admins(make_user, client_for, maq):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    sup = make_user(roles={"qaloun-men": ["supervisor"]})
    r = client_for(admin).post(f"/api/v1/people/?maqraa={maq['qaloun-men'].pk}",
                               {"full_name": "ش/ فلان الفلاني", "role": "sheikh", "phone": "+216 98 123 456"}, format="json")
    assert r.status_code == 201
    q = maq["qaloun-men"].pk
    assert any(p["phone"] == "+21698123456" for p in client_for(admin).get(f"/api/v1/people/?maqraa={q}").json())
    assert all(p["phone"] is None for p in client_for(sup).get(f"/api/v1/people/?maqraa={q}").json())


def test_super_admin_sees_all_audit(make_user, client_for, maq):
    admin = make_user(roles={"qaloun-men": ["admin"]})
    client_for(admin).get(f"/api/v1/maqraat/{maq['hafs-men'].pk}/today/")
    boss = make_user(super_admin=True)
    entries = client_for(boss).get("/api/v1/audit/").json()
    assert any(e["outcome"] == "denied" for e in entries)


def test_admin_audit_is_scope_only(make_user, client_for, maq):
    boss = make_user(super_admin=True)
    client_for(boss).post(f"/api/v1/maqraat/{maq['hafs-men'].pk}/links/", {"kind": "zoom", "url": "https://zoom.us/j/9"}, format="json")
    admin = make_user(roles={"qaloun-men": ["admin"]})
    entries = client_for(admin).get("/api/v1/audit/").json()
    assert all(e["maqraa_id"] in (maq["qaloun-men"].pk, None) or e["maqraa_id"] == maq["qaloun-men"].pk for e in entries)
    assert not any(e["maqraa_id"] == maq["hafs-men"].pk for e in entries)
