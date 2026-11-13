# Cloudflare storage migration

## Decisions

- Preserve `https://usopoke.asonde.me`, card UUIDs and `/card-ogp.png?id=…`.
- Upgrade Remix 2 / Pages Functions to React Router Framework Mode / Workers, first verifying the framework against the existing Supabase adapter.
- Keep application-owned card types, a narrow card repository and an image store. No authentication is added: creation is anonymous, gallery membership controls discovery, not read authorization.
- Use private R2 with same-origin image responses and immutable cache keys. Cache hits avoid D1/R2 reads. Canonical cache keys ignore unrelated query strings. Never fetch arbitrary stored URLs.
- D1 uses parameterized queries and dense gallery slots for uniform indexed draws. Non-gallery expiry queries use a partial index. No unbounded per-request scans or retry loops.
- New cards default to not joining the gallery. Non-gallery cards expire after 14 days; a bounded daily cleanup removes their rows and image objects. Responses must not be cached past expiry. The user requested no new expiry UI.
- Existing expired cards and unreferenced objects are preserved in the verified local backup, not required in the serving database. All gallery cards are retained. New cards are not automatically backed up to the user's PC.

## Inventory (initial snapshot)

Supabase project `bppgbaxsswwmvfxabgmk`: 16,106 cards, 8,278 gallery cards, 16,150 storage objects, 13,692,474,651 bytes. All 16,106 card URLs map to distinct existing objects in `card_images`. Five unreferenced objects are PDFs; they belong only in the backup, not image serving. The live schema includes `twitter_username` and the live random RPC filters gallery cards; checked-in Supabase migrations are incomplete.

## Cutover gates

1. Export live rows, storage inventory and schema. Save every object locally with SHA-256 and byte-length verification; reconcile all IDs and fields.
2. Copy retained images with SHA-256 validation by R2 and verify remote object inventory. Import retained rows preserving IDs, timestamps and fields.
3. Test local and deployed preview: form creation, card page, draw, image download, OGP, missing IDs, malformed/oversized uploads, rate limits and expiry. Check type/lint/build and security advisories.
4. Freeze INSERT at Supabase itself (cards and storage), not just the frontend. Snapshot the final delta and reconcile again before routing the production hostname.
5. Verify production with cold caches; confirm no Supabase requests are needed. Preserve the old deployment and backups. Roll back code against the new D1/R2 data after accepting new writes; never revert to a stale Supabase snapshot without reverse-copying new cards.
6. Remove temporary migration infrastructure. User performs Supabase project deletion after the final report.

Raw `*.supabase.co` links cannot survive project deletion. Existing service card and OGP URLs remain valid for retained cards. X's cache is independent of Cloudflare cache; deletion readiness depends on cold-cache independence from Supabase, not an assumed seven-day X refresh guarantee.

## Cost

R2 Standard is $0.015/GB-month before free allowances; the original 13.7GB is approximately $0.21/month storage only. Requests and Workers usage are separate. R2 Internet egress is free. Recheck https://developers.cloudflare.com/r2/pricing/ before relying on prices.

## Completed production cutover — 2026-11-14 JST

- Production hostname now routes to Worker `usopoke`, version `d19c13ce-ee13-43f1-8c9a-9746004c1a1e`. Workers.dev and preview URLs are disabled. Legacy `usopoke.pages.dev` redirects to the canonical hostname; its Pages deployment is `da1c3054-1e54-411c-9041-9122877ab338`.
- Runtime: React Router 8.5.1 Framework Mode, React 19, Cloudflare Workers. Application code no longer uses Supabase.
- Source INSERT permissions were frozen at 2026-11-13 14:54:38 UTC. The final snapshot matched all 16,106 original cards. Supabase data has not been deleted.
- All 16,150 original storage objects (13,692,474,651 bytes) are backed up locally, including expired cards and unreferenced objects. Durable backup: `/Users/retca/Backups/usopoke/2026-11-13`. `cards.json`, schema/inventory and `verified-checksums.json` allow objects (named by storage object UUID) to be mapped back to original keys. Reverify with `node scripts/migration/verify-backup.mjs <backup-directory>`.
- D1 contains the 8,278 retained gallery cards, reconciled field by field. R2 contains their 8,278 images (6,796,872,260 bytes), reconciled by size and SHA-256. The 7,828 expired non-gallery cards remain in the local backup only.
- Local browser and production browser creation succeeded; the production test card's OGP returned a 1200×630 PNG. The test card and image were removed afterward. Existing retained cards, random draw, image/OGP responses, conditional requests and expired-card responses were checked.
- Typecheck, lint, build and eight tests passed; dependency audit reported zero advisories. Migration transfer Worker was deleted. The daily cleanup runs at 03:00 JST, at most 100 expired cards per run; expired reads are rejected immediately even when deletion is queued.
- Supabase project deletion can be performed by the owner after reviewing this report. There is no required seven-day cache waiting period: retained service URLs resolve against D1/R2 on cache misses. Raw Supabase URLs stop working after deletion, as accepted. Do not delete the separate `piku-page` project.

### Operating constraints

Keep the Pages project/custom-domain association while using the current Worker route. Its fallback deliberately returns 503 on the canonical hostname if that route is removed. Roll back application code against D1/R2; do not re-enable the old Supabase application after new production writes. Database restore and image recovery require a coordinated decision, not just a code rollback.

An ambiguous D1 write failure preserves its uploaded image rather than risking deletion of a successfully committed card; the image key is logged for reconciliation. Retention is bounded, so a backlog above 100/day requires an operator to increase cleanup capacity deliberately. Rate limits are approximate per Cloudflare location, not a global spending cap. The local snapshot covers migration-time data only, not future posts.

At R2 Standard rates, retained images cost about $0.11/month for storage before free allowances. Compute/request charges are additional. Supabase Pro remains $25/month if another project still needs it; removing one Micro project from a multi-project organization typically removes about $10/month of compute, not the entire Pro subscription. Verify the actual invoice and instance size before claiming exact savings.
