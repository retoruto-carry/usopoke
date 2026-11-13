# Production audit — 2026-11-14 JST

Follow-up audit after the D1/R2 cutover. This records verified scope rather than a guarantee that future failures cannot occur.

## Findings corrected

- Canonical application pages previously accepted HTTP without redirecting to HTTPS. The Worker redirects HTTP requests on `usopoke.asonde.me` to the same path/query over HTTPS with 308. Local development remains HTTP-capable. Static assets served before the Worker are outside this redirect.
- The home page had no document title or sharing metadata; these now identify the existing service and reference an existing site image.
- Card3 interpolated four values from one React Spring value, producing invalid CSS transforms. It now interpolates the four actual spring values.
- Image sharing treated error response bodies as PNG files. It now checks status, type and non-empty content; failed image reads fall back to text sharing and user cancellation stops the flow.
- Two existing hologram textures failed browser loading with `ERR_BLOCKED_BY_ORB` from Google Drive. Identical original PNG bytes are now served as local static assets across the three existing card variants.
- Upload checks previously accepted signature/IHDR/IEND without actual image data. The canvas-PNG validator now checks bounded chunk layout and checksums, RGB/RGBA dimensions, compressed scanline length and filters. Unknown ancillary metadata is stripped. Inflation stops when output exceeds the expected image size, with bounded chunk overhead. This protects storage and gallery integrity without adding a general-purpose upload API.

## Data and infrastructure checks

- The source is frozen for application writes: anon INSERT grant revoked; authenticated role has no applicable INSERT RLS policy; no storage INSERT policies remain. No source data changed after the final snapshot.
- The local snapshot's 16,150 objects and 13,692,474,651 bytes were independently rehashed. All 16,106 card rows reconcile with the frozen source; 8,278 retained and 7,828 expired rows account for every original card.
- All 8,278 retained images were decoded locally without errors. The largest was 720×1007 pixels. Reports are in `/Users/retca/Backups/usopoke/2026-11-13`.
- Legacy Auth users and identities (two each) are additionally archived in owner-readable `legacy-auth.json`. No current login flow depends on them. Old session tokens are intentionally not preserved as a usable login system.
- Worker bindings contain only D1, R2 and three rate limiters. The custom-host route targets `usopoke`; Pages redirects to the canonical host; the workers.dev entry point is disabled. Public DNS resolves through Cloudflare and HTTPS requests succeed. The current CLI token cannot enumerate DNS zone records, so DNS was checked through public resolution, live TLS/HTTP, and the configured Worker route/Pages domains.
- The scheduled cleanup is configured as `0 18 * * *` (03:00 JST). Expiry and bounded deletion are exercised in local D1/R2 integration tests. A real 14-day production lifecycle has not elapsed yet; that does not create a Supabase dependency.

## Browser and response checks

- In-app browser with Supabase domains blocked: homepage, random pack opening and retained card image work. No application requests to Supabase were observed. The temporary browser block is removed after testing.
- At 390px viewport width the card page has no horizontal overflow and its image loads.
- HTML and `.data` responses, image and OGP responses, 400/404/405 paths, cache validators and expiry were checked. Application source/build contain no Supabase runtime references.
- Targeted Worker request logs showed no uncaught exceptions. A cold OGP render and later cache hit both succeeded; the latter used substantially less CPU. This is a functional check, not a load test or global cost guarantee.

## Supabase deletion decision

No one- or two-week waiting period is required. The 14-day period applies to new non-gallery cards on D1/R2. Retained old card URLs and OGP URLs resolve without Supabase even on a cache miss. Raw Supabase URLs will cease working, as accepted by the owner. Delete only project `bppgbaxsswwmvfxabgmk`, not other projects or the whole organization. Project deletion remains an owner action.

## Final verification

Deployed Worker version: `e65c1eaa-e97f-43fe-bee3-78ab7977844b`.

- Typecheck, lint, build and all 12 tests pass. Dependency audit reports zero advisories. The PNG tests include a 130 MiB expansion attempt against workerd followed by a valid request to the same worker. Real Chrome and WebKit Canvas samples passed.
- The production browser created an unlisted test card. Its D1 record had exactly 1,209,600 seconds (14 days) of retention; image and 1200×630 OGP returned 200 with expiry-capped cache headers. Browser download bytes matched the served image SHA-256. Test row/object were removed afterward.
- The production form action rejected the formerly accepted malformed PNG with 400. The React Router index action is addressed as `/?index`; plain POST `/` has no root action and correctly returns 405.
- HTTP application requests now return 308 preserving path and query. The fixed card transform produces a valid matrix3d. Both local hologram assets load successfully, with no network failures in the final browser observation.
- One exception was observed inside the external X embed iframe (`platform.twitter.com/embed/...`, `appendChild` TypeError). It was not in the application runtime; posting, drawing, image display and downloading continued successfully. The third-party widget has not been replaced or hidden. This audit does not claim zero possible external-widget errors or physical iOS/Android native-share validation.

## Repeat audit and card reveal — 2026-11-14 JST

- Before the owner reported deleting Supabase, the live source still had 16,106 cards and 16,150 objects, with anon INSERT disabled. After the reported deletion, a new unlisted test card was created successfully; its page and freshly generated OGP returned 200. Two other retained card pages also returned 200. The temporary test row/object were removed.
- Fresh browser checks with browser cache disabled and Supabase hosts blocked passed. Three sampled retained pages and their 1200×630 OGP images returned 200 using the Twitterbot user-agent. This checks HTTP compatibility, not X's private cache state.
- Independent code review found no new confirmed backend defect. The two form editing buttons now explicitly use `type="button"`; this is preventive clarification, not a claimed reproduction of accidental submission. Browser testing with a valid form showed zero submission requests when adding/removing a move.
- The existing three-second pack opening now preloads and decodes the selected image. The result shows the existing card back while loading, then reveals the decoded front with a 280ms opacity/position transition. Reduced motion uses a 100ms opacity-only transition. Failed images show an explanatory message rather than remaining blank. The existing card hover transform is untouched.
- Local and production browser tests deliberately held image requests, verified the back remained visible, then released them and confirmed the front reached the ready state. Local failure and reduced-motion paths were checked. Production request timestamps showed image fetching starting roughly three seconds before result-page data navigation. Browser cache disabling during this test can cause a second image request; normal immutable caching permits reuse.
- Typecheck, lint and build passed; the unchanged backend tests were rerun (12 passing).
- Cloudflare's version-create API returned HTTP 500 / code 10013 while uploading source maps. Upload and deployment without source maps succeeded; this narrows the workaround but does not prove the service's root cause. Logs remain enabled. For recurrence, use `npx wrangler deploy --no-upload-source-maps` after building. The normal deploy script remains unchanged.
- Current production Worker version: `58ac6490-1623-4033-a75e-253182c81402`.

### Recovery scope

The local archive provides card rows, every original storage object, schema descriptions, and legacy Auth user/identity records. It is a data-reconstruction backup, not an in-place restoration of a deleted Supabase project. Rebuilding on Supabase would require a new project, schema/import work, and reconnection; old project IDs/URLs and existing sessions are not restored. An end-to-end restoration into a new Supabase project has not been performed. New Cloudflare posts are not part of the migration-time snapshot.
