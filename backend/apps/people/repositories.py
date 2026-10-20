from .models import Person, PersonAlias


def find_by_alias_key(key: str) -> Person | None:
    alias = PersonAlias.objects.filter(alias_key=key).select_related("person").first()
    return alias.person if alias else None


def create_person(**fields) -> Person:
    return Person.objects.create(**fields)


def add_alias(person: Person, alias: str, key: str) -> None:
    PersonAlias.objects.get_or_create(alias_key=key, defaults={"person": person, "alias": alias})


def get_system(person_id: int) -> Person | None:
    return Person.objects.system().filter(pk=person_id).first()


def get_for_actor(actor, person_id: int) -> Person | None:
    return Person.objects.for_actor(actor).filter(pk=person_id).first()


def names_system(person_ids: list[int]) -> dict[int, Person]:
    return {p.pk: p for p in Person.objects.system().filter(pk__in=person_ids)}


def possible_duplicates() -> list[tuple[Person, Person]]:
    """Persons whose name keys are token-subsets of each other (candidate merges, reported not auto-merged)."""
    people = list(Person.objects.system().filter(active=True).order_by("name_key"))
    out = []
    for i, a in enumerate(people):
        ta = set(a.name_key.split())
        for b in people[i + 1:]:
            tb = set(b.name_key.split())
            if ta and tb and (ta <= tb or tb <= ta) and min(len(ta), len(tb)) >= 2:
                out.append((a, b))
    return out
