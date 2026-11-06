# V5 validation — 2026-11-06

Development self-test in the isolated cloud project. No independent audit, real Shopify merchant, payment sandbox or real transaction involved.

| Check | Result | Evidence |
|---|---|---|
| Next.js standalone production build | passed | `evidence/v5/build.log` |
| Cloudflare static export build | passed | `evidence/v5/static-build.log` |
| Unit regression | 20 passed | `evidence/v5/unit.log` |
| Source storefront browser suites | 13 passed | `evidence/v5/server-browser-results.json` |
| Actual static artifact browser suites | 13 passed | `evidence/v5/static-browser-results.json` |
| Local simulated Shopify suites | 10 passed | `evidence/v5/shopify-browser-results.json` |
| Formatting | passed | `evidence/v5/format.log` |
| Type check | passed | `evidence/v5/typecheck.log` |
| Source/archive/runtime integrity | passed: ZIP CRC, SHA256 manifest, extracted startup, 8 routes, image/JS, commerce denial | `delivery/v5/VERIFIED-V5.json` |
| gift.zzyuan.top public browser checks | UNVERIFIED | `docs/v5/DEPLOYMENT-RECORD.md` |
| Mainland Wi-Fi/cellular access | UNVERIFIED | No mainland probe available |
| Real payments/orders/fulfillment | NOT CONNECTED / UNVERIFIED | Deferred by scope |

Desktop 1440×1000, tablet 820×1180, phone 390×844; additional 320px overflow and reduced-motion check. Each server/static suite includes 48 selected WCAG2A/AA/2.1AA axe page scans, with zero reported violations. This is not a complete accessibility certification.

Covered: home/catalog/direct routes, all nine concept products and decoded local images; keyword/category/price/sort/no-result/reset; gift finder and URL refresh; gift gallery and keyboard/Esc/focus; preview quantity/subtotals/update/delete/refresh; damaged/denied storage; cross-tab header count; safe concept boundary/no real checkout API; mobile menus, dialog scroll lock, focus wrap, sticky CTA hide/show; console and page errors in exercised flows. Five policy/FAQ pages were scanned at all three primary sizes.

## Problems found and fixed
- New test code initially used HTMLElement image methods without a type guard; corrected before successful build.
- Header quantity rendering initially consumed the damaged-storage repair warning. Changed it to a non-repairing read and added a unit regression.
- Native anchor default navigation overrode quantity focus after mobile CTA activation. Explicitly handle scroll and focus; respect reduced motion.
- Native dialog Tab boundaries could leave the controls for browser chrome. Added explicit forward/backward wrapping to menu and image modal.
- Scroll-unlock effect is asynchronous; its test now polls the observable state rather than asserting before React completes the update.
- Static deployment intentionally has no /api/cart route (404); source design mode explicitly forbids it (403 DESIGN_ONLY). Both conditions are asserted separately.

## Screenshot evidence
`evidence/v5/static-*` is captured from the generated static build; `server-*` from the Node build. `01-before-*` are current-round V4 baseline captures. Full-page product captures hide the fixed CTA for stitching only; viewport and interaction captures retain real behavior. See `docs/v5/DESIGN-REVIEW.md` for the screenshots inspected and observations.

## Public check limit
Current managed session remains on the earlier policy revision without gift.zzyuan.top. Independent web open returned a tool-access error without a site response. User reported a new task with domain allowed but unavailable environment proxy. No claim of a website outage or success is made, and no DNS change was performed. V5 was not deployed during this round.
