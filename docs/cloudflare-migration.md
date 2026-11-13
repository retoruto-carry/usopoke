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
