"""Architecture rules enforced in CI (section 2A)."""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APPS = ROOT / "apps"


def test_import_linter_contracts_hold():
    result = subprocess.run([sys.executable, "-m", "importlinter.cli", "--config", str(ROOT / "pyproject.toml")],
                            cwd=ROOT, capture_output=True, text=True)
    if result.returncode != 0 and "No module named" in result.stderr:
        result = subprocess.run(["lint-imports"], cwd=ROOT, capture_output=True, text=True)
    assert result.returncode == 0, result.stdout[-2000:] + result.stderr[-500:]


def test_views_contain_no_orm_calls():
    pattern = re.compile(r"\.objects\b|\.filter\(|\.select_related\(|\.save\(\)")
    for path in APPS.glob("*/views.py"):
        assert not pattern.search(path.read_text()), f"ORM call in controller {path}"


def test_user_facing_code_never_uses_system_scope():
    """`.system()` is for repositories (jobs, public pages, conflict detection) - never for views/services."""
    for name in ("views.py", "services.py"):
        for path in APPS.glob(f"*/{name}"):
            assert ".system(" not in path.read_text(), f"unscoped access in {path}"


def test_no_role_name_checks_outside_the_policy_module():
    pattern = re.compile(r"\.role\s*==|role\s*==\s*['\"](sheikh|supervisor|admin)")
    for path in APPS.rglob("*.py"):
        if "tests" in path.parts or "migrations" in path.parts or path.name == "policy.py":
            continue
        assert not pattern.search(path.read_text()), f"hard-coded role check in {path}"


def test_secrets_are_not_committed():
    forbidden = re.compile(r"(password|secret)\s*=\s*['\"][^'\"]{6,}['\"]", re.I)
    for path in (ROOT / "config").rglob("*.py"):
        text = path.read_text()
        for m in forbidden.finditer(text):
            assert "insecure-dev-key" in m.group(0) or "change-me" in m.group(0) or "dummy" in m.group(0), (path, m.group(0))
