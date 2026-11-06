# V5 design and flow review

Developer self-review using current-run local browser captures. No claim of independent review, public-site acceptance or complete accessibility conformance.

## Evidence and numbered flow
1. Home → catalog: healthy in desktop/tablet/mobile local tests. Original editorial hero preserved, search/category/price/sort and reset remain functional. Screenshots: `evidence/v5/static-desktop-home.png`, `static-mobile-collection.png`.
2. Gift-set detail: improved. Baseline `01-before-desktop-gift.png` had one concept image and a repeated generic box drawing. `static-desktop-the-little-thank-you-full.png`, `static-desktop-the-slow-sunday-full.png`, `static-desktop-the-evening-edit-full.png` show dedicated contents, closed-box compositions and packaging chapters with each set's palette. These screenshots were opened and inspected. The packaging close-up is explicitly a crop from the opening concept, not an independent product photograph.
3. Image exploration: healthy in local keyboard tests. Two distinct gift-set artworks, labeled thumbnails, previous/next controls, modal enlargement, arrow navigation, Esc, focus restoration and scroll locking. Background is inert via native dialog. Artwork remains fictional; small packaging differences are disclosed.
4. Add → bag → update/remove → refresh: healthy in local tests. Quantity and subtotal derive from concept catalog, feedback identifies preview-only behavior. `static-mobile-add-feedback.png` was inspected: readable response and View your bag link, no sticky CTA obscuring the form. Header count synchronizes across tabs. Damaged storage warning remains visible; denied storage uses session memory with a warning.
5. Mobile menu / narrow viewport: healthy in local tests. Menu cycles Tab/Shift+Tab within controls, Esc returns focus; bottom CTA hides while form or footer is visible. 390px and 820px captures plus 320px overflow checks. `static-mobile-the-evening-edit-full.png` was inspected. Full-page stitching hides the fixed CTA ONLY during those captures; separate viewport and interaction checks exercise the actual CTA.
6. Public access: blocked from validation. No successful page response from gift.zzyuan.top in this round. User's domain binding is not modified. Neither deployment health nor mainland reachability can be judged from the tool/network error.

## Remaining limits
Long-form detail pages intentionally add image and contents depth; user feedback on pacing is still useful after upload. Concept images do not satisfy real-product photo verification. Selected axe rules and Chromium checks do not establish complete WCAG conformance or Safari/Firefox behavior. Public navigation and cache behavior must be checked after deployment.
