"""Package only allowlisted website source/evidence and the standalone build."""
from pathlib import Path
import hashlib
import io
import json
import tarfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "delivery/v5"
OUT.mkdir(parents=True, exist_ok=True)
RUNTIME = ROOT / ".next/standalone"
if not (RUNTIME / "server.js").exists():
    raise SystemExit("Run npm run build first")

# Preserve upstream license files in the runtime and record discoverable packages.
notices = ["# Third-party dependency notices", "", "Generated from the standalone build. Original licenses remain alongside runtime dependencies. Package metadata is informational; upstream license files govern. System fonts are not redistributed.", "", "| Package | Version | Declared license |", "|---|---|---|"]
seen = set()
for f in sorted((RUNTIME / "node_modules").rglob("package.json")):
    data = json.loads(f.read_text())
    name, version = data.get("name", f.parent.name), data.get("version", "bundled")
    if (name, version) in seen:
        continue
    seen.add((name, version))
    license_value = str(data.get("license", "See upstream files")).replace("|", "/")
    notices.append(f"| {name} | {version} | {license_value} |")
notices += ["", "## Included license-file paths", ""]
for f in sorted((RUNTIME / "node_modules").rglob("*")):
    if f.is_file() and f.name.lower().startswith(("license", "licence", "copying", "notice")):
        notices.append(f"- `{f.relative_to(RUNTIME)}`")
(ROOT / "THIRD-PARTY-NOTICES.md").write_text("\n".join(notices) + "\n")

# Do not label a release ready before its two actual builds have passed browser QA.
for evidence in ["server-browser-results.json", "static-browser-results.json", "shopify-browser-results.json"]:
    report = json.loads((ROOT / "evidence/v5" / evidence).read_text())
    assert report["stats"]["unexpected"] == 0 and report["stats"]["expected"] > 0, evidence
files = set()
for folder in ["app", "components", "lib", "config", "public", "tests", "scripts"]:
    for f in (ROOT / folder).rglob("*"):
        if not f.is_file() or f.is_symlink():
            continue
        rel = f.relative_to(ROOT)
        if "__pycache__" in rel.parts or str(rel).startswith("public/design-notes/") or f.name == "create-supplier-pack.py":
            continue
        files.add(rel)
for name in ["AGENTS.md", "README.md", "START-HERE.md", "HANDOFF.md", "TASKS.md", "FACTS.md", "ASSETS.md", "VALIDATION-V5.md", "THIRD-PARTY-NOTICES.md", ".env.example", ".gitignore", ".prettierignore", "package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts", "next.config.ts", "playwright.config.ts", "playwright.design.config.ts", "playwright.showcase.config.ts"]:
    if (ROOT / name).is_file():
        files.add(Path(name))
for name in ["WEBSITE-PRODUCT-PLAN.md", "BUYER-GUIDE.md", "CUSTOMIZATION.md", "RIGHTS-AND-TRANSFER.md", "SHOPIFY-SETUP.md", "BUSINESS-ONBOARDING.md", "PRODUCT-INTAKE.csv", "LIVE-ACCEPTANCE.csv", "OPERATIONS.md", "RELEASE.md"]:
    files.add(Path("docs") / name)
for f in (ROOT / "evidence/v5").glob("*"):
    if f.is_file() and f.suffix in {".json", ".log"}:
        files.add(f.relative_to(ROOT))
for f in (ROOT / "docs/v5").glob("*.md"):
    files.add(f.relative_to(ROOT))
# A positive allowlist is used; never inspect or package actual .env files.
for rel in files:
    if any(part.startswith(".env") and part != ".env.example" for part in rel.parts):
        raise SystemExit("Private environment path rejected")
manifest = "\n".join(f"{hashlib.sha256((ROOT / f).read_bytes()).hexdigest()}  {f}" for f in sorted(files)) + "\n"
(ROOT / "FILES-V5.txt").write_text(manifest)
files.add(Path("FILES-V5.txt"))
source = OUT / "morrow-muse-v5-website-source.zip"
with zipfile.ZipFile(source, "w", zipfile.ZIP_DEFLATED) as z:
    for rel in sorted(files):
        z.write(ROOT / rel, "morrow-muse-v5/" + str(rel))

runtime = OUT / "morrow-muse-v5-linux-runtime.tar.gz"
prefix = "morrow-muse-v5-runtime"
def runtime_filter(info):
    parts = Path(info.name).parts
    if any(part.startswith(".env") for part in parts) or "/public/design-notes" in info.name:
        return None
    return info
with tarfile.open(runtime, "w:gz") as t:
    t.add(RUNTIME, arcname=prefix, filter=runtime_filter)
    for name in ["README.md", "START-HERE.md", "ASSETS.md", "THIRD-PARTY-NOTICES.md", "VALIDATION-V5.md"]:
        t.add(ROOT / name, arcname=prefix + "/" + name)
    script = b'#!/bin/sh\nset -eu\ncd "$(dirname "$0")"\nexport STORE_MODE=design\nexport E2E_FIXTURE=\nexport HOSTNAME=127.0.0.1\nexport PORT="${PORT:-4400}"\nexec node server.js\n'
    info = tarfile.TarInfo(prefix + "/start-preview.sh")
    info.size, info.mode = len(script), 0o755
    t.addfile(info, io.BytesIO(script))
    for f in sorted(files):
        if f.parts[0] == "docs":
            t.add(ROOT / f, arcname=prefix + "/" + str(f))
evidence_archive = OUT / "morrow-muse-v5-test-evidence.zip"
with zipfile.ZipFile(evidence_archive, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted((ROOT / "evidence/v5").glob("*")):
        if f.is_file() and f.suffix in {".png", ".json", ".log"}:
            z.write(f, "evidence/v5/" + f.name)
checksums = "\n".join(f"{hashlib.sha256(f.read_bytes()).hexdigest()}  {f.name}" for f in [source, runtime, evidence_archive, OUT / "morrow-muse-v5-cloudflare.zip"]) + "\n"
(OUT / "SHA256SUMS-V5.txt").write_text(checksums)
print(checksums)
print(f"Source: {source.stat().st_size} bytes; runtime: {runtime.stat().st_size} bytes")
