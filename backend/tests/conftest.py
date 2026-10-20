import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.access.models import MaqraaAccess
from apps.maqraat.models import Maqraa
from apps.people.models import Person

User = get_user_model()
SLUGS = ["qaloun-men", "qaloun-women", "hafs-men", "hafs-women"]


@pytest.fixture
def maq(db):
    """slug -> Maqraa (seeded by migration)."""
    return {m.slug: m for m in Maqraa.objects.system().all()}


@pytest.fixture
def make_user(db, maq):
    counter = {"n": 0}

    def _make(name=None, roles=None, super_admin=False, password="Str0ng-Passw0rd!", email=None, phone=None):
        counter["n"] += 1
        name = name or f"user{counter['n']}"
        person = Person.objects.create(full_name=name, name_key=name)
        user = User.objects.create_user(name, password, person=person, is_super_admin=super_admin, email=email, phone=phone)
        for slug, role_list in (roles or {}).items():
            for role in role_list:
                MaqraaAccess.objects.create(person=person, maqraa=maq[slug], role=role)
        return user

    return _make


@pytest.fixture
def client_for():
    def _client(user):
        c = APIClient()
        if user is not None:
            c.force_authenticate(user)
        return c

    return _client
