"""Derive a static concept site from the primary source. No network publication."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / ".release-work/showcase"
OUT = ROOT / "delivery/v5"
STAGE.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
# Regenerate only our known staging directory; never modify a published checkout.
for name in ["app", "components", "lib", "config", "public", ".next", "out"]:
    target = STAGE / name
    if target.exists():
        shutil.rmtree(target)
for name in ["app", "components", "lib", "config", "public"]:
    shutil.copytree(ROOT / name, STAGE / name, ignore=shutil.ignore_patterns("design-notes", "__pycache__"))
for name in ["package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts"]:
    shutil.copy2(ROOT / name, STAGE / name)
if not (STAGE / "node_modules").exists():
    (STAGE / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)
shutil.rmtree(STAGE / "app/api")
for name in ["cart.ts", "queries.ts", "shopify.ts"]:
    (STAGE / "lib" / name).unlink()

def write(name, content):
    (STAGE / name).write_text(content)

def replace(name, old, new):
    p = STAGE / name
    text = p.read_text()
    if text.count(old) != 1:
        raise RuntimeError(f"Source adapter needs review: {name}")
    p.write_text(text.replace(old, new))

write("next.config.ts", '''import type { NextConfig } from "next";
const config: NextConfig = { output: "export", trailingSlash: true, images: { unoptimized: true }, poweredByHeader: false };
export default config;
''')
write("lib/config.ts", '''export const fixtureMode = () => false;
export const isDesignPreview = () => true;
export const storeState = (): { connected: boolean; mode: string } => ({ connected: true, mode: "design" });
export function settings(): { origin: string } { throw new Error("Static concept showcase has no commerce configuration"); }
''')
write("lib/storefront.ts", '''import "server-only";
import { designProducts } from "./design-catalog";
export const catalog = async () => designProducts;
export const product = async (handle: string) => designProducts.find(p => p.handle === handle) || null;
''')
write("lib/browser-bag.ts", '''import { DesignBag } from "./design-bag";
import type { PublicCart } from "./types";
type BagResult = { ok: boolean; cart?: PublicCart; message?: string; checkoutUrl?: never };
const bag = new DesignBag(() => window.localStorage);
export function readPreviewQuantity() { return bag.get(false).cart.quantity; }
export async function readBag(_preview: boolean): Promise<BagResult> { return bag.get(); }
export async function changeBag(_preview: boolean, data: Record<string, unknown>): Promise<BagResult> {
  const result = bag.change(data);
  window.dispatchEvent(new Event("morrow-bag-updated"));
  return result;
}
''')
replace("app/layout.tsx", 'export const dynamic = "force-dynamic";', '')
replace("app/products/[handle]/page.tsx", 'const getProduct = cache(product);', '''const getProduct = cache(product);
export async function generateStaticParams() { return (await catalog()).map(p => ({ handle: p.handle })); }
''')
replace("app/policies/[kind]/page.tsx", 'import { shopInfo } from "@/lib/shopify";', '''async function shopInfo(): Promise<Record<string, {body:string} | null>> { throw new Error("Commerce unavailable in showcase"); }
export function generateStaticParams() { return ["shipping", "returns", "privacy", "terms"].map(kind => ({kind})); }
''')
replace("components/Bag.tsx", '''      if (!preview && result.ok && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
''', '')
write("app/robots.ts", '''export const dynamic = "force-static";
export default function robots() { return { rules: { userAgent: "*", disallow: "/" } }; }
''')
write("app/sitemap.ts", '''export const dynamic = "force-static";
export default function sitemap() { return []; }
''')
for route, view, title in [("shop", "ShopView", "The collection"), ("gifting", "GiftingView", "The gifting edit")]:
    write(f"app/{route}/page.tsx", f'''import {{ Suspense }} from "react";
import Content from "./Content";
export const metadata = {{ title: {json.dumps(title)} }};
export default function Page() {{ return <Suspense fallback={{<div className="page"><h1>{title}</h1><p>Loading your selection…</p></div>}}><Content /></Suspense>; }}
''')
    write(f"app/{route}/Content.tsx", f'''"use client";
import {{ useSearchParams }} from "next/navigation";
import View from "@/components/{view}";
import {{ designProducts }} from "@/lib/design-catalog";
export default function Content() {{ const query = useSearchParams(); return <View all={{designProducts}} params={{Object.fromEntries(query.entries())}} preview />; }}
''')

subprocess.run([str(ROOT / "node_modules/.bin/next"), "build", "--webpack"], cwd=STAGE, check=True)
headers = '''/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Robots-Tag: noindex, nofollow
'''
write("out/_headers", headers)
files = sorted(f for f in (STAGE / "out").rglob("*") if f.is_file())
manifest = {str(f.relative_to(STAGE / "out")): hashlib.sha256(f.read_bytes()).hexdigest() for f in files}
write("out/release.json", json.dumps({"version": "v5", "kind": "concept-showcase", "payments": False, "files": manifest}, indent=2) + "\n")
archive = OUT / "morrow-muse-v5-cloudflare.zip"
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted((STAGE / "out").rglob("*")):
        if f.is_file():
            z.write(f, f.relative_to(STAGE / "out"))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert "index.html" in z.namelist() and "404.html" in z.namelist()
    assert not any(".env" in n or n.startswith("api/") for n in z.namelist())
    for rel, sha in manifest.items():
        assert hashlib.sha256(z.read(rel)).hexdigest() == sha
(OUT / "STATIC-BUILD.json").write_text(json.dumps({"archive": archive.name, "sha256": hashlib.sha256(archive.read_bytes()).hexdigest(), "bytes": archive.stat().st_size, "files": len(manifest) + 1, "publicDeployment": "not performed", "packageIntegrity": "passed"}, indent=2) + "\n")
print(archive)
