# Morrow & Muse — V5

English beauty and gifting concept storefront, Next.js + TypeScript. Three gift-set stories, nine concepts, searchable catalog, gifting guide, persistent preview bag and responsive layouts. Images and prices are illustrative; no orders or payments are created in design mode.

## Run
Node >=22.9.0 (validated environment: Node 24.19.0).
```
npm ci
npm run build
HOSTNAME=127.0.0.1 PORT=4400 npm run preview:design
```
This starts an internal preview service. A localhost URL is not a publicly shareable deployment.
For development: `npm run dev:design`. Without explicit design mode or independently configured Shopify, the default is maintenance. `.env.example` documents future commerce configuration; never copy Bingkui credentials or any unrelated store configuration.

## Validate
```
npm test
npm run test:design
npm run test:e2e
npm run build:showcase
npm run test:showcase
npm run typecheck
npm run format:check
```
Browser tests need Chromium (`/usr/bin/chromium` in this environment, or `PLAYWRIGHT_CHROMIUM_EXECUTABLE`). Design/server, static artifact and local simulated Shopify tests are separate. No Shopify account or real payment has been validated. See `VALIDATION-V5.md` for actual results and limits.

## Build and deliver the Cloudflare showcase
```
npm run build:showcase
npm run test:showcase
python3 scripts/package-website.py
python3 scripts/verify-delivery.py
```
The production Node build and all three browser suites must pass first. Static export derives from shared components and data in this source; it has no API routes, Shopify transport or payment redirect. Its temporary workspace `.release-work/showcase` is generated and must not be edited. The source build and static build have distinct entry adapters; shared UI lives in `components`.

- Uploadable website: `delivery/v5/morrow-muse-v5-cloudflare.zip` (index.html at ZIP root).
- Full source: `delivery/v5/morrow-muse-v5-website-source.zip`.
- Linux Node runtime (extract, then run `sh start-preview.sh`): `delivery/v5/morrow-muse-v5-linux-runtime.tar.gz`.
- Screenshots, source PNG artwork and logs: `delivery/v5/morrow-muse-v5-test-evidence.zip`.
- SHA256 and runtime verification: `delivery/v5/SHA256SUMS-V5.txt`, `VERIFIED-V5.json`.

Cloudflare target is the existing `raspy-cherry-c3b6` project bound to `gift.zzyuan.top`. V5 has NOT been uploaded in this round. Public availability and mainland reachability are unverified because the checker did not obtain a website response. Do not infer an outage from the environment error.

Read [update and rollback instructions](docs/v5/RELEASE-AND-ROLLBACK.md), [handoff](HANDOFF.md), [asset sources](docs/v5/ASSET-REGISTER.md) and [transfer boundaries](docs/RIGHTS-AND-TRANSFER.md). Supplier work and real Shopify onboarding are deferred. A complete concept website is not evidence that a merchant can accept payments or fulfill orders.
