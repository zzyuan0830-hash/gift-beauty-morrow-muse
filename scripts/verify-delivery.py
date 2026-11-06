"""Verify package manifests and start an extracted runtime, using no shop credentials."""
from pathlib import Path
import hashlib
import json
import os
import re
import signal
import subprocess
import tarfile
import tempfile
import time
import urllib.request
import urllib.error
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "delivery/v5"
source = OUT / "morrow-muse-v5-website-source.zip"
runtime = OUT / "morrow-muse-v5-linux-runtime.tar.gz"
results = {"scope": "Local package integrity and extracted Linux runtime; no live merchant or public deployment"}
with zipfile.ZipFile(source) as z:
    assert z.testzip() is None
    names = z.namelist()
    assert all(not name.startswith("/") and ".." not in Path(name).parts for name in names)
    assert not any("docs/supplier/" in n or "public/design-notes/" in n for n in names)
    assert not any(any(x.startswith(".env") and x != ".env.example" for x in Path(n).parts) for n in names)
    for line in z.read("morrow-muse-v5/FILES-V5.txt").decode().splitlines():
        digest, rel = line.split("  ", 1)
        assert hashlib.sha256(z.read("morrow-muse-v5/" + rel)).hexdigest() == digest, rel
    for rel in ["config/concepts.json", "config/brand.json", "app/gifting/page.tsx", "package-lock.json", "docs/BUYER-GUIDE.md", "scripts/package-website.py"]:
        assert "morrow-muse-v5/" + rel in names
    results["source"] = {"zipCRC": "passed", "manifest": "passed", "files": len(names), "supplierMaterials": "excluded", "privateEnvironmentFiles": "excluded"}

checks = ROOT / ".delivery-checks"
checks.mkdir(exist_ok=True)
work = Path(tempfile.mkdtemp(prefix="v5-", dir=checks))
with tarfile.open(runtime) as t:
    assert not any(any(x.startswith(".env") for x in Path(m.name).parts) for m in t.getmembers())
    t.extractall(work, filter="data")
app = work / "morrow-muse-v5-runtime"
log = open(ROOT / "evidence/v5/extracted-runtime.log", "w")
process = subprocess.Popen(["sh", "start-preview.sh"], cwd=app, env={"PATH": os.environ["PATH"], "PORT": "4494"}, stdout=log, stderr=log, start_new_session=True)
base = "http://127.0.0.1:4494"
def get(path):
    with urllib.request.urlopen(base + path, timeout=4) as r:
        return r.status, r.read()
try:
    for attempt in range(80):
        try:
            status, health = get("/api/health")
            break
        except (urllib.error.URLError, TimeoutError):
            if process.poll() is not None:
                raise RuntimeError("Extracted runtime stopped")
            time.sleep(0.25)
    else:
        raise RuntimeError("Extracted runtime did not start")
    results["runtimeHealth"] = json.loads(health)
    checked = []
    for path in ["/", "/shop", "/products/the-slow-sunday", "/gifting?preference=sets&budget=50", "/bag", "/about", "/faq", "/policies/privacy"]:
        code, body = get(path)
        assert code == 200 and b"<html" in body
        assert b"concept products" in body
        checked.append(path)
    code, body = get("/concepts/gift-open.webp")
    assert code == 200 and body[:4] == b"RIFF"
    _, html = get("/")
    js = re.search(rb'<script[^>]+src="([^"]+\.js[^"]*)"', html)
    assert js and get(js.group(1).decode())[0] == 200
    try:
        get("/api/cart")
        raise AssertionError("Concept cart API unexpectedly opened")
    except urllib.error.HTTPError as e:
        assert e.code == 403
        assert json.loads(e.read())["error"] == "DESIGN_ONLY"
    results["runtime"] = {"startup": "passed", "pages200": checked, "webpAndJs": "passed", "realCartForbidden": "passed", "isolatedEnvironment": "PATH and preview PORT only"}
finally:
    if process.poll() is None:
        os.killpg(process.pid, signal.SIGTERM)
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
    log.close()
results["archives"] = [{"file": f.name, "bytes": f.stat().st_size, "sha256": hashlib.sha256(f.read_bytes()).hexdigest()} for f in [source, runtime]]
results["status"] = "passed"
(OUT / "VERIFIED-V5.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))
