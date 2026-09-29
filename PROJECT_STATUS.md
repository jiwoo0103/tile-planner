# Project status and stage handoff

## Final local handoff — 2026-09-27

Mandatory stages 1–17 were handled sequentially with a fresh subagent for each. Stages 18–19 were excluded by the user. Local tools, four original guides, both homepages, project detail and supporting pages are implemented. Main-agent desktop/mobile and cross-site navigation review is complete; the stage sections below retain the history of checks.

Latest runtime verification: 112 tests passed; both Astro checks were clean; configured/default builds and site configuration checks passed. Final verification covers 15 HTML pages and 3 JavaScript files, including an advertising-activation negative fixture that failed as expected and was removed. Preview servers remain at http://localhost:4321/ and http://localhost:4322/; final screenshots are under `verification/`.

This is not a public launch or full roadmap acceptance. Real operator/contact data, approved public domains and live processing details are missing. Search Console ownership/submission, AdSense connection/review/approval, certified CMP integration and actual advertising remain unverified or blocked. No real ad loader or CMP was invented or activated. See `IMPLEMENTATION_AUDIT.md` for each acceptance status.

Original reference images are preserved. Temporary test content and fixture processes/files were cleaned up. No extra worktree or persistent child chat was created; no commit, push, deployment or external account write occurred.

## Stage 1 — Tile purchase calculator

Implementation: complete locally, including main-agent desktop/mobile browser review. Public deployment unverified and not performed.

- `/calculator/` provides rectangular room/tile dimensions, individual US/metric units and a system toggle, waste percentage, whole tiles per box, optional USD box price, live area/base/required/box/purchased/cost results, reset and worked-example actions.
- Exact rational arithmetic preserves physical values during unit switches and handles integer rounding boundaries. Allowance applies to the unrounded area ratio, then rounds up. The reference mockup's 3.5 × 4.2 m / 60 cm tile example incorrectly says 46 tiles; implemented formula gives **45** required tiles and still **12** four-tile boxes. The roadmap's 10 × 12 ft case yields **132 tiles / 14 boxes / 140 purchased tiles**.
- Invalid/missing/out-of-range inputs clear the result immediately. Bounds and cost scope are documented in README. No grout or cutting optimization is claimed.
- Reference desktop/mobile images inspected before implementation. Implemented navy/teal/white visual language using real form controls and a small decorative CSS tile grid; supplied images preserved unchanged. No unfinished nav items exposed.
- Root has a minimal calculator entry. Shared layout, favicon, static 404, metadata, conditional production sitemap/robots, Tailwind 4 and Cloudflare static-assets config are in place. No public domain invented.

Verification run on 2026-09-27:

- `npm test`: 25 tests passed, including exact conversion, allowance/box rounding, boundary cases, invalid/extreme inputs, omitted/zero price.
- `npm run check`: Astro/TypeScript check passed with 0 errors, 0 warnings, 0 hints.
- `npm run build`: static build passed; generated calculator, root, 404 and robots.
- `npm install`: completed with zero audit vulnerabilities. An indirect optional font library (`undici` via `unifont`) declares Node >=22.19; actual Node 22.13.1 ran checks/build successfully. Recommend Node >=22.19 for future installs; no global runtime changes made.
- Main-agent browser verification: default 132 tiles /14 boxes; metric conversion to3.048m preserves132; blank width clears results; keyboard reset restores defaults; $30 per box produces $420. A390px viewport has no horizontal overflow. Desktop and full mobile layouts inspected.

Handoff:

- Start preview: `npm run dev -w apps/tile -- --port 4321`; open `/calculator/`.
- Stage 2 can reuse SiteLayout, global `.prose-content`, and `src/lib/calculator.ts` as source of truth. No guide pages/collections were pre-created.
- Query inputs support example reproduction; see README. Stage 3 should reuse calculate() for purchase estimates and must keep rendered pieces distinct from purchases.
- Production domain/account and explicit publication authorization remain required; no commits, pushes, deployments, external writes, worktrees, or persistent child chats were created.

## Stage 2 — Measuring a room guide

Implementation: complete locally; main agent desktop/mobile browser review pending. Not deployed.

- `/guides/how-to-measure-a-room-for-tile/` is a complete English guide covering rectangular measurement, units and decimal feet, calculator field mapping, a reproducible 120 sq ft / 132 required tiles / 14 boxes example, common errors, and unsupported shapes.
- Added a typed Astro local Markdown collection and static article route with generated heading links, readable responsive article layout, topic, modification date, sources, and calculator navigation. No guide index or future placeholder page is exposed. The calculator links to the finished guide.
- Original accessible SVG preserves the example's 10:12 room proportions and labels perpendicular dimensions and 120 sq ft area. Source guidance checked: Astro content collections, Fireclay Tile's quantity guide, and NIST's SI length reference. The example's 10% allowance is explicitly a teaching input, not a manufacturer recommendation.
- SiteLayout metadata and configured production sitemap behavior also apply to the new static route. Calculator nav no longer appears active on guide pages.

Verification run on 2026-09-27:

- `npm test`: **26 passed** across 2 files, including a regression that extracts the guide's actual calculator URL and reproduces all stated purchase counts and omitted cost.
- `npm run check`: **0 errors, 0 warnings, 0 hints** after fixing an initial test-only type import typo.
- `npm run build`: **passed**, 4 static HTML pages including the article; diagram copied to output.
- Built article anchor inspection: **8 local anchors, 0 unresolved**. Main agent reviewed the article and 390 px layout, verified no horizontal overflow and followed the actual example link to reproduce 132 tiles / 14 boxes.
- Git inspection reported that the workspace is not a Git repository; no diff/commit/push possible or attempted. No deployment, external writes, new dependencies, browser server, worktree, or persistent chat created.

Handoff: subsequent guide stages can add Markdown entries to `apps/tile/src/content/guides/`; the schema requires `title`, `description`, `topic`, and `updatedDate`. Only finished entries should be added because every entry builds a public route. Production URL and deployment remain external prerequisites.

## Stage 3 — Rectangular 2D tile layout

Implementation: complete locally, including main-agent desktop/mobile browser review. Not deployed.

- `/layout/` provides individually unit-aware room/tile sizes, grout, 0°/90° orientation, corner/center start, an automatically scaled SVG floor plan, full/cut distinction, major room dimensions and four edge-piece dimensions. The supplied desktop/mobile layout references were inspected; unsupported diagonal/herringbone/custom offsets were excluded as required by the roadmap.
- Center definition is explicit: for each axis longer than a tile, use the minimum number N = ceil((L+G)/(T+G)) of pieces spanning both walls; equal first/last edges have width (L − (N−2)T − (N−1)G)/2. Interior pieces are full. A room axis no longer than a tile uses one clipped piece. This balances edges, preserves exact fits and avoids choosing an unspecified arbitrary centerline offset.
- Corner placement starts with a full tile and clips at the far walls; when a wall falls inside a grout joint, the trailing grout strip is reported explicitly. Grout is 0–25 mm and smaller than each tile dimension. No extra perimeter movement gap is implied.
- Geometry uses exact rational arithmetic for counts and edge sizes; numeric conversion happens for SVG coordinates/display. More than 2,500 pieces triggers an outline-only preview before rectangle allocation, retaining analytical counts and dimensions. Invalid input clears stale results.
- Purchase estimates reuse `calculate()` unchanged. Full/cut counts are clearly distinguished from source tiles or minimum purchase quantities; no cutting optimization or grout area deduction is promised. Calculator/layout URL links carry physical values, waste, boxes, price, grout, orientation and start; bounded exact values preserve rounded unit conversions. No browser storage is used. Main navigation exposes the real layout page.

Verification run on 2026-09-27:

- `npm test`: **38 passed**, including center/corner edge counts and widths, exact division, grout zero, oversized tiles, rotation, trailing grout, equivalent units, large counts, all piece extents accounting for room length, and exact URL handoff.
- `npm run check`: **0 errors, 0 warnings, 0 hints**.
- `npm run build`: **passed**, 5 static HTML pages.
- `npm run verify:links`: **passed**, 5 pages checked for metadata, unique IDs, internal links and assets.
- Main-agent browser review: default centered opposing edges are 295.8 mm and 293.8 mm; grout zero gives 120 full tiles and no cuts. At 390 px there is no horizontal overflow. Changing tile width to 6 in and orientation to 90° with centered/grout-zero layout passes through calculator (264 required tiles) and returns with all those settings preserved.
- Additional browser checks: 1 × 1 in tiles yield 17,280 placed pieces with the outline-only render limit; blank room width removes the previous SVG and edge statistics. Desktop appearance reviewed; browser console has zero errors.
- Main-agent follow-up fixed native-reset event timing: explicit default restoration now precedes state recalculation. Browser regression confirms blank width → Reset restores 99 full tiles / 21 cut pieces / 14 boxes and clears the invalid flag. Included in subsequent stage regression checks.
- No Git repository exists in this workspace, so Git diff checking is unavailable. No commits, pushes, deployment, external writes, dependencies, worktrees, extra preview server or persistent child chats were created. No temporary artifacts added.

Handoff: stage 4 can reuse the existing Markdown guide structure and live calculator links. The layout definition is documented in README and on the page; `src/lib/layout.test.ts` protects it. Production remains unverified until an approved domain/account and publication authorization are supplied.

## Stage 4 — Tile waste allowance guide

Implementation: complete locally; main-agent desktop/mobile browser review pending. Not deployed.

- `/guides/tile-waste-allowance/` explains cutting, breakage and deliberate repair stock; conditions affecting the allowance; percentage application before rounding; and why box surplus is distinct from allowance or guaranteed remaining spares.
- Original comparison uses one 120 sq ft room, 12 × 12 in tiles and 10 tiles per box at illustrative 0%, 5%, 10%, 15% and 20% rates. Each row links to its exact calculator inputs. Required tiles are 120/126/132/138/144; boxes are 12/13/14/14/15. Prices are omitted. A focusable horizontal table region contains narrow-screen overflow.
- Fireclay Tile's current FAQ and quantity article checked September 27, 2026. Manufacturer percentages are explicitly tied to that manufacturer's context; comparison inputs are explicitly not universal installation recommendations. The article links to measuring, calculator and layout pages; the calculator and measuring article link back. No guide index or future placeholders were added.

Verification run on 2026-09-27:

- `npm test`: **39 passed** across 3 files. New regression extracts all five actual Markdown table rows and URL inputs, calls `calculate()`, and checks displayed counts, whole-box surplus and omitted cost.
- `npm run check`: **0 errors, 0 warnings, 0 hints**.
- `npm run build`: **passed**, 6 static HTML pages.
- `npm run verify:links`: **passed**, 6 pages checked for metadata, unique IDs, internal links and local assets.
- Browser visual/interaction review belongs to the main agent; not claimed by this stage agent. Workspace has no Git repository, so Git diff verification remains unavailable.
- No commits, pushes, deployments, external writes, new dependencies, worktrees, extra preview server, persistent chats or disposable artifacts were created.

Handoff: stage 5 may reuse the same guide template and regression pattern for the whole-box purchase case. The stage 4 table deliberately demonstrates that 10% and 15% can round to the same purchase while leaving different box surplus; preserve that distinction in later examples.

## Stage 5 — Whole-box purchase example

Implementation: complete locally; main-agent desktop/mobile browser review pending. Not deployed.

- `/guides/tile-box-purchase-example/` follows a 3.5 × 4.2 m room, 60 × 60 cm tiles, illustrative 10% allowance, 4 tiles per box and hypothetical $32.50 USD per box through a complete purchase calculation.
- Area is 14.7 m²; the unrounded ratio is 40.8333…; base count is 41; required quantity is 45; 12 full boxes purchase 48 tiles for $390.00. The article demonstrates why applying the allowance to the rounded base incorrectly produces 46. Shared `calculate()` behavior is unchanged.
- It distinguishes 3 box extras from 7 tiles above the base count and from actual usable leftovers. The 10% allowance, pack size and price are explicitly teaching assumptions. Budget exclusions and final product/order checks are explained. Fireclay's FAQ was verified through current search-index content for its quantity review and full-box return context; direct FAQ fetching timed out. No supplier price is used or claimed.
- Reuses the existing Markdown article layout. The waste guide links to the finished example; its calculator deep link includes every dimension, unit, allowance, box count and price input. README documents the new guide. No guide index or future placeholder added.

Verification run on 2026-09-27:

- `npm test`: **40 passed** across 3 files. The new regression extracts the article's actual calculator URL, verifies exact inputs including price, runs `calculate()`, and compares the result with its visible summary table. It also protects the early-rounding distinction and total above-base quantity.
- `npm run check`: **0 errors, 0 warnings, 0 hints**.
- `npm run build`: **passed**, 7 static HTML pages.
- `npm run verify:links`: **passed**, all 7 pages checked for metadata, unique IDs, internal links and local assets.
- Main-agent browser review is pending and not claimed by this stage agent. Workspace has no Git repository, so Git diff verification remains unavailable.
- No commits, pushes, deployments, external writes, new dependencies, worktrees, extra preview server, persistent chats or disposable artifacts were created.

Handoff: review `/guides/tile-box-purchase-example/` at desktop/mobile widths and follow its example link. Expected calculator results are 14.7 m² / 41 base / 45 required / 12 boxes / 48 purchased / $390.00, with 3 box extras and all source inputs loaded. Stage 6 can reuse the article template and existing exact layout logic.

## Stage 6 — Tile layout starting-point guide

Implementation: complete locally; main-agent desktop/mobile browser review pending. Not deployed.

- `/guides/tile-layout-starting-point/` compares one 3200 × 4100 mm floor with 600 × 600 mm tiles, 2 mm grout and a 0° straight grid. Exact deep links open each option in the layout planner with identical purchase inputs (illustrative 10%, four tiles per box, no price).
- Corner edges are left/right 600/190 mm and top/bottom 600/488 mm, with 30 full tiles and 12 cut pieces. Centered edges are 395/395 mm and 544/544 mm, with 20 full tiles and 22 cut pieces. Both have six columns, seven rows and 42 placed pieces.
- Two accessible static SVG endpoints generate their piece geometry with the same `planLayout()` and `axisPiece()` functions used by the live tool. Diagram geometry uses uniform scaling and includes edge dimensions, accessible descriptions and full/cut labels. No generated illustrative mockup substitutes for geometry.
- The article explains the minimum piece count per axis, equal opposite edges, exact fits, corner pieces and trailing grout; it distinguishes this geometry from minimum purchases, offcut optimization or installation sequence. Marazzi USA's floor installation guidance was read directly and cited for dry-layout and perimeter-gap context. The tool does not add that perimeter gap; the article makes the limitation explicit.
- Existing layout and purchase-example pages link to the completed guide. No guide index or future placeholders were added. No dependencies changed.

Verification run on 2026-09-27:

- `npm test`: **41 passed** across four files. New regression parses both actual article URLs and the visible comparison table, checks known dimensions/counts and compares all 84 diagram rectangles plus full/cut styling against the live engine.
- `npm run check`: **0 errors, 0 warnings, 0 hints**.
- `npm run build`: **passed**, eight static HTML pages and two generated SVG endpoints.
- `npm run verify:links`: **passed**, all eight pages checked for metadata, IDs, links and local assets. Both built SVGs also parsed successfully as XML and each contains 42 piece rectangles.
- Browser visual/interaction review belongs to the main agent and remains pending. No Git repository exists in this workspace, so Git diff checking is unavailable.
- No commits, pushes, deployments, external writes, worktrees, extra preview server, persistent chats or disposable artifacts were created.

Handoff: review `/guides/tile-layout-starting-point/` at desktop/mobile widths and follow both option links. Expected edges/counts appear above. Stage 7 can now list the four finished Markdown guides through the existing collection; no stage 7 implementation is included here.

Main-agent stage 5 browser review: actual purchase-example link opens the calculator with 3.5m × 4.2m,60cm tiles,10%,4/box and32.50 USD; visible results45/12/48 and390 USD. Temporary browser debugger failure recovered using a fresh tab.

## Stage 7 — Browse finished guides

Implementation: complete locally; main-agent final desktop/mobile browser review pending. Not deployed.

- `/guides/` reads the existing Astro content collection and lists the four finished articles once each, alphabetically by title. Responsive cards provide the actual topic, title, description and a single article link. There are no placeholder entries, empty categories or search controls.
- The index offers calculator and layout links, every article has an All guides link, and shared navigation exposes Guides on mobile as well as desktop. The mobile header uses a separate navigation row so all three primary destinations remain visible. The pre-existing skip-link accessibility fix is preserved.
- No content schema, calculation, layout engine or dependency changes were required. Adding a finished Markdown article with the existing required metadata automatically adds both its route and index card.

Verification run on 2026-09-27:

- `npm test`: **41 passed** across four files.
- `npm run check`: **0 errors, 0 warnings, 0 hints**.
- `npm run build`: **passed**, nine static HTML pages and the two existing SVG endpoints.
- `npm run verify:links`: **passed**, all nine pages checked for metadata, unique IDs, internal links and local assets.
- Built-index inspection confirmed exactly four unique card links matching all four actual Markdown files, their exact title/description/topic values, existing article destinations and both tool links.
- Added an actual temporary Markdown file named `stage-seven-verification-fixture.md` and rebuilt: exactly five unique cards appeared, with the new entry's metadata and real article route. Deleted only the disposable source fixture, rebuilt, and verified exactly four cards, no fixture text and no leftover built fixture route. Main-agent browser also observed the temporary fifth entry during verification.
- Main agent confirmed mobile Guides navigation; final clean-index visual review remains with the main agent. Workspace has no Git repository, so Git diff checking is unavailable.
- No commits, pushes, deployments, external writes, new dependencies, worktrees, preview servers or persistent chats were created. No disposable fixture remains.

Handoff: review `/guides/` at desktop/mobile widths, confirm four cards and follow article/tool links. Stage 8 can reuse the finished index and collection for the tile project home; no stage 8 implementation is included here.

Main stage6 review: actual article and center deep link checked in390px browser;395/395mm and544/544mm edges,20full/22cut,11boxes. Fresh PC/mobile layout screenshots saved in verification/.

## Stage 8 — Tile project home

Implementation: complete locally, including main-agent desktop/mobile browser review. Not deployed.

- Replaced the temporary `/` entry with a complete tile planning home: clear purchase-planning purpose, primary calculator and secondary layout actions, two real tool previews, four finished guides, a three-step workflow and explicit calculation/layout limits.
- Inspected both supplied stage 8 desktop/mobile references before implementation. Preserved the navy/teal/white styling and shared navigation. The mobile primary action remains near the top; tool and guide cards stack responsively.
- The two tool previews are byte-identical copies of the main-agent calculator/layout desktop browser screenshots under `public/assets/previews/`; only CSS crops their display. They are labeled actual tool screens with example inputs. The desktop hero reuses the existing engine-generated centered-layout example SVG and links to its finished article. Supplied reference images and original captures are untouched.
- Featured cards read the existing collection's actual titles, descriptions and topics in a curated order: measuring, waste allowance, buying full boxes and starting point. All buttons target existing tools, guide pages or calculation explanations. No future features, brand domain or new dependencies were introduced.
- Home copy distinguishes purchase estimates from placed pieces, excludes unsupported patterns/irregular rooms/offcut optimization, states the 2,500-piece drawing limit, specifies USD tile-only cost and explains that inputs are not stored in browser storage. Existing local `noindex, nofollow` behavior is preserved.

Verification run on 2026-09-27:

- `npm test`: **41 passed** across four files.
- `npm run check`: **0 errors, 0 warnings, 0 hints**.
- `npm run build`: **passed**, nine static HTML pages and the two existing SVG endpoints.
- `npm run verify:links`: **passed**, all nine pages checked for metadata, unique IDs, internal links and local assets.
- Built-home inspection confirmed exactly four featured guide cards and local noindex. SHA-256 comparisons confirmed both copied screenshot assets match their original captures.
- Main-agent browser review passed at 1440 px and 390 px: no horizontal overflow; the mobile primary CTA appears at y=410 inside the first viewport; keyboard Enter on it opens the calculator. Full screenshots were visually reviewed and saved as `verification/tile-home-desktop.png` and `verification/tile-home-mobile.png`.
- No Git repository exists in this workspace, so Git diff verification is unavailable. No commits, pushes, deployments, external writes, new dependencies, worktrees, preview servers or persistent chats were created by this stage.

Handoff: stage 9 can describe the now-finished tile project using its actual home, calculator, layout and four guides. Public domain/account configuration and explicit publication approval remain prerequisites for deployment.

Main stages6–7 final browser review: desktop guide index has4uniquecards and article navigation works;390px screenshot reviewed with nohorizontaloverflow. Both starting-point SVGimages loaded successfully and centered diagram visually matches395/395and544/544mm. Mobile Guides navigation remains reachable.

## Stage 9 — Independent project detail site

Implementation: complete locally, including main-agent desktop/mobile browser review. Not deployed.

- Added `apps/brand` as an independent static Astro 7.3.5 / Tailwind CSS 4.3.3 workspace using the already installed pinned versions. `/projects/tile-planner/` explains the planning problem, intended audience, actual calculator/layout/guide features, usage, limits and verification. Its root is only a minimal entry link; the full representative home remains stage 10.
- Typed file-driven metadata in `apps/brand/src/data/projects.ts` supplies the actual project entry to both root and detail page and is ready for stage 10 reuse. No future projects, invented public brand, operator identity or production URL is displayed. The default name is the descriptive `Projects`, configurable with `BRAND_NAME`.
- Original walkthrough uses a 9 × 11 ft room, 12 × 24 in tiles, illustrative 10% allowance, eight tiles per box and hypothetical $48 per box. It produces 99 sq ft, 55 required tiles, seven boxes, 56 purchased tiles and $336 USD tile cost. With 2 mm grout and a 0° corner start, the grid has 40 full / 14 cut pieces; center has 28 full / 26 cut pieces and 296.8 mm / 452.2 mm opposite edges. The purchase estimate stays at seven boxes. These claims are checked against the actual tile engines and linked query inputs.
- Inspected real desktop calculator/layout and mobile calculator captures. Published copies are byte-identical; CSS crops the previews and captions link to the full images. The images show their original default-input verification scenarios, not a fabricated rendering of the new walkthrough. Supplied references and original captures remain untouched.
- Separate build origins use `BRAND_SITE_URL` and `TILE_SITE_URL`; tile-only `PUBLIC_SITE_URL` remains compatible and conflicting values fail. Origins are validated, must differ and never fall back to a public placeholder. Configuring a public brand requires a tile destination. Missing own origins produce noindex/blocked robots/no canonicals/no sitemap; missing target origins suppress cross-site links. Development-only links use tile port 4321 and brand port 4322. Tile's only UI change is a conditional About this project footer link.
- Both apps have separate Workers Static Assets configs, output directories, 404 pages and trailing-slash routing. No deployment, remote configuration, account/domain assignment or Wrangler CLI execution occurred. Cloudflare's official Static Assets and HTML handling documentation was checked through the Cloudflare skill.

Verification run on 2026-09-27:

- `npm test`: **61 passed** (20 brand/config/data tests and 41 existing tile tests). Tests include invalid origin handling, independent origins and legacy alias conflicts, live worked-example outputs, real route presence and screenshot SHA-256 equality.
- `npm run check`: **0 errors, 0 warnings, 0 hints** for both workspaces.
- `npm run build`: **passed**, three brand HTML pages and nine tile HTML pages, plus existing endpoints.
- `npm run verify:links`: **passed**, all 12 pages checked for metadata, unique IDs, internal links and assets.
- `npm run verify:sites`: **passed**, independently built both apps with reserved example.com test origins and verified actual separate canonicals, crosslinks, configured name, robots and sitemaps. Rebuilt both without origins and verified noindex, no canonical/sitemap, no fixture values and no localhost links. The script deliberately leaves both outputs private and unconfigured. It does not fetch or deploy fixture domains.
- Initial config used an unsupported Astro callback form; main-agent runtime review caught missing settings. Replaced both with supported static config objects and reran build, configuration verification and type checks. Main-agent fresh-tab review confirmed corrected settings, styles and links.
- Main-agent browser QA passed at 1440 px and 390 px with screenshot review and no horizontal overflow. Following the actual brand example link reproduced 55 tiles / seven boxes / 56 purchased / $336 in Tile Planner. The tile footer returned to the brand detail page.
- Workspace still has no Git repository, so Git diff verification is unavailable. No commits, pushes, deployment, external writes, new dependency versions, worktrees or persistent child chats were created. Package-lock-only workspace registration ran offline; the known Node 22.13.1 versus optional dependency >=22.19 warning remains. Preview servers and browser review were managed by the main agent.

Handoff: stage 10 can reuse the single `projects` array and its site-key/path/image fields. Keep `import.meta.env.DEV` localhost fallback restricted to development when adding project actions. Public origins, actual display name/operator details and explicit publication authorization remain external prerequisites. Brand detail is available locally on port 4322; root remains intentionally minimal.

## Stage 10 — Representative project collection home

Implementation: complete locally, including main-agent desktop/mobile browser review. Not publicly configured or deployed.

- Replaced the representative root entry with a complete, responsive home for practical web projects: a clear collection purpose, project browsing, actual screenshot card, overview/direct-use actions and a general approach section. It is not a tile-specialist brand home. Only the implemented Tile Planner project appears; there are no future cards, fabricated metrics, credentials or testimonials.
- Continued the existing navy/teal/soft green style without additional reference images, following the user's explicit instruction to proceed without questions. The screenshot reuses the already verified real calculator capture, labeled as a cropped screen with example inputs. No image generation or new dependencies were needed.
- Homepage cards read the existing `projects` array. A second finished project can specify its approved `siteUrl` in the same metadata file; the existing public HTTPS-origin validator checks it. Tile Planner still uses its environment-configured site key, with no alternate-origin fallback when configuration is absent. New entries also require a real detail route and screenshot asset. No homepage component edit is necessary to display their supplied metadata and actions.
- Shared brand navigation now opens the collection and approach sections; the detail page returns to All projects. Direct-use links retain development-only localhost fallbacks and disappear from unconfigured static output with an honest unavailable-address message. The supported static Astro config remains unchanged.
- README explains the finished home and how to add a real project. Actual brand name, approved public origins and operator identity are still missing. `Projects` remains a neutral configurable heading. This stage does not establish a public service or complete production publication prerequisites.

Verification run on 2026-09-27:

- `npm test`: **62 passed** (21 brand/config/data tests and 41 tile tests). The additional case checks a metadata-supplied HTTPS destination, invalid/local origins and configured-site fallback suppression.
- `npm run check`: **0 errors, 0 warnings, 0 hints** for both workspaces.
- `npm run build`: **passed**, three brand and nine tile HTML pages plus existing endpoints.
- `npm run verify:links`: **passed**, all 12 pages checked for metadata, IDs, links and local assets.
- Added a temporary second project record to the actual metadata file and a real temporary detail route; built and verified exactly two homepage cards, the fixture's title, feature labels, detail route and independent destination. Restored the original metadata, removed only the owned temporary route and rebuilt. Confirmed one card and no fixture source/built route, text, destination or development origin residue.
- `npm run verify:sites`: **passed** including new homepage checks for its own canonical, real detail path and configured cross-site destination. Both outputs were restored to private noindex builds without public fixture or localhost links; final link verification passed again.
- Main-agent browser QA passed at 1440 px and 390 px. The homepage has one real project card, no horizontal overflow, and its actual Use Tile Planner link opens the tile home. Screenshots were reviewed and saved as `verification/brand-home-desktop.png` and `verification/brand-home-mobile.png`.
- No Git repository exists in this workspace, so Git diff verification remains unavailable. No commit, push, deployment, external write, dependency change, worktree, new preview server or persistent chat was created by this stage. No disposable fixture remains.

Handoff: stage 11 can build the operator/about page from the finished representative site. Unprovided operator identity must remain explicit rather than being invented; no about or contact page was added in this stage.

## Stage 11 — Operator and production principles

Implementation: About page implemented locally, including main-agent desktop/mobile browser review. **BLOCKED: the required actual operator public name and introduction have not been supplied.** The stage's real-operator completion criterion is not satisfied. Not publicly configured or deployed.

- Added representative `/about/` with the collection's genuine purpose, actual engine/content/browser verification methods, explicit purchase and layout limits, and a concrete error-correction process. It links to the implemented project overview and reproducible worked example. No installation experience, credentials, reviewers, operator identity or entity are invented.
- Added About to shared brand navigation and Operator & principles to the tile footer. The latter follows the existing configured-brand-origin / development-only localhost rule. Missing public target origins suppress cross-site links in static output. Brand navigation stacks on narrow screens to accommodate the new link.
- Added centrally validated `OPERATOR_PUBLIC_NAME` (120 characters) and `OPERATOR_BIO` (1,000 characters) process environment fields. Empty or partial information permits normal local builds but renders an honest incomplete-preview notice. Both are plain single-line text, trimmed and checked for controls/length, and escaped by Astro when displayed. Format validation does not verify a person's identity or claims; only actual supplied/approved information belongs there.
- About remains `noindex, nofollow` and absent from the sitemap when identity is incomplete, even if public origins are configured. A complete supplied profile still requires a public brand origin to be indexable. The brand Astro configuration remains a supported static `defineConfig` object; only its sitemap filter changed. No contact/privacy page or future service was introduced.
- README now explains the page, environment fields, truthful-content prerequisite and indexing behavior. Real operator information remains an external prerequisite; the user's instruction to continue without questions did not turn missing information into a fabricated biography.

Verification run on 2026-09-27:

- `npm test`: **65 passed** (24 brand/config/data and 41 tile tests), including empty/partial identity, trimming, control-character and length validation.
- `npm run check`: **0 errors, 0 warnings, 0 hints** in both workspaces.
- `npm run build`: **passed**, four brand and nine tile HTML pages plus existing endpoints.
- `npm run verify:sites`: **passed**. Local reserved-domain fixtures tested About canonical and both-site links, HTML escaping of supplied name/bio, configured profile indexing and sitemap inclusion, and missing-identity noindex/sitemap exclusion despite configured origins. Both outputs restored to unconfigured private builds; no fixture profile or public/development origins remain in them.
- `npm run verify:links`: **passed**, all 13 HTML pages checked for metadata, unique IDs, internal links and local assets.
- Main-agent browser QA: About has no horizontal overflow at 390 px or 1440 px; the incomplete-operator notice and noindex metadata were confirmed. The tile footer's actual Operator & principles link opens the brand About page. Mobile capture saved as `verification/about-mobile.png`. Supplied identity was tested through escaped fixture builds, not browser review of a real operator profile, since no real profile exists yet.
- Git diff verification is unavailable because the workspace has no Git repository. No commit, push, deployment, external write, dependency change, extra preview server, worktree or persistent chat was created.

Handoff: local browser QA is complete. A future stage must preserve the incomplete-identity publication gate. Stage 12 may add the actual contact channel once supplied; About currently makes no claim that a working reporting channel exists. Operator identity remains required for stage 11 completion.

## Stage 12 — Error reports and contact

Implementation: Contact page implemented locally; main-agent browser review pending. **BLOCKED: no actual operator contact email has been supplied.** The real-email completion criterion is not satisfied. Not publicly configured or deployed.

- Added representative `/contact/` with complete guidance for a reproducible error report: page/article URL, reproduction steps, exact inputs and units, observed versus expected result, browser and device. The page distinguishes purchased tiles from placed pieces and links to the existing walkthrough/correction principles. It asks visitors to remove private details from links and screenshots.
- Missing contact configuration produces an honest pending notice, no mailbox, copy button, mailto action or submission form. The page stays `noindex, nofollow` and is excluded from the sitemap even with configured public origins. No imaginary mailbox or nonfunctional send form is displayed.
- Added centrally validated `OPERATOR_CONTACT_EMAIL` process environment configuration for one plain public mailbox. When supplied, the page renders escaped address text, an encoded mailto with a report outline and a copy button. Copy waits for clipboard success; rejected/unavailable clipboard access explains how to select/copy manually or open the mail app. Neither action claims delivery. Address syntax validation does not verify ownership or deliverability.
- Brand navigation and footer link to Contact; the tile footer follows the existing configured-brand-origin/development-only localhost rule. Tile footer wraps on wider screens to accommodate the additional link. No external email, database, server endpoint, new dependency or future feature was introduced.
- README documents configuration, honest missing-data behavior, the privacy caution and fixture-only verification. The supported static Astro configuration only changes the brand sitemap filter to preserve independent About and Contact completeness gates.

Verification run on 2026-09-27:

- `npm test`: **83 passed** (42 brand/config/contact/data tests and 41 tile tests). New tests cover missing/valid/invalid mailbox values, mailto address/query encoding, asynchronous clipboard completion and denied/unavailable-copy fallback.
- `npm run check`: **0 errors, 0 warnings, 0 hints** for both apps.
- `npm run build`: **passed**, five brand and nine tile HTML pages plus existing endpoints.
- `npm run verify:sites`: **passed**. Reserved `example.com` fixtures verified actual rendered contact actions, HTML escaping, mailto decoding, both-site links, canonical/indexing/sitemap inclusion when configured, and no actions/noindex/sitemap exclusion when the email is absent despite configured origins. Both outputs were restored to private unconfigured builds with no fixture addresses or public/development origins. No message was sent.
- `npm run verify:links`: **passed**, all 14 pages checked for metadata, unique IDs, links and local assets. Browser review belongs to the main agent; no real mailbox or delivery can be verified without supplied operator information.
- Git diff verification is unavailable because the workspace has no Git repository. No commit, push, deployment, external write, dependency change, additional preview server, worktree or persistent chat was created.

Handoff: `/contact/` is ready for local browser review on brand port 4322. Preserve both incomplete-profile and incomplete-contact publication gates in subsequent stages. Supplying a real approved public mailbox and verifying its ownership/delivery remain external prerequisites for stage 12 completion; test-only fixtures are not operator details.

Main stage12 browser QA: temporary reserved qa+contact@example.com configuration on local brand preview exercised actual Copy email address button successfully (nothing sent), mailto recipient/body encoding inspected,390px nooverflow. Fixture process stopped and ordinary server restarted; actualcontactpage has pendingnotice,nomailto/nocopybutton,noindex. Tilefootercontactnavigationworks. Screenshot verification/contact-mobile.png is the restored unconfigured page.

## Stage 13 — Privacy and data handling

Implementation: substantive privacy notice implemented locally, including main-agent desktop/mobile browser review. **BLOCKED: actual operator/contact information and deployed hosting/data handling have not been verified.** The requirement that no operating information remains unconfirmed is not satisfied. Not deployed.

- Added representative `/privacy/`, explicitly covering the collection and Tile Planner. It distinguishes in-browser calculation from query-bearing navigation, including measurements, precision values, optional price and layout settings. It explains that input edits do not rewrite the address bar, and Reset does not erase old URLs, browser history, shared copies or possible host records.
- Described the actual absent account/database/browser-save/advertising/analytics/CMP features without a blanket claim that no personal information is processed. Contact/profile text follows existing configuration. Clipboard writes only the public email after a click; mailto opens a draft outside this site and does not send through the site. Email provider, access, retention and location remain unverified.
- Distinguished locally configured Cloudflare Workers Static Assets from verified live hosting. Read the official Cloudflare privacy policy's End Users section and Static Assets overview on 2026-09-27; linked both in the notice. No provider retention period, region, identity or legal compliance guarantee is invented. No Cloudflare or Google service was activated.
- Privacy stays unconditionally `noindex, nofollow` and excluded from the sitemap even when both origins, an operator profile and contact fixture are supplied. Changing a domain alone cannot certify deployment or handling. Real operating facts and page content must be reviewed before changing this gate. Both site footers link to the notice using the established conditional cross-site pattern; unconfigured static tile output omits the unavailable brand link.
- README documents the local notice, actual-data prerequisite, indexing gate and obligation to update the notice with future data-processing features. No new environment fields or speculative service integrations were added.

Verification run on 2026-09-27:

- `npm run test -w apps/brand`: **42 passed**, existing related configuration/contact/project tests. Calculator logic was unchanged.
- `npm run check`: **0 errors, 0 warnings, 0 hints** in both apps.
- `npm run verify:sites`: **passed**, building both apps with reserved fixtures and again without configured origins. Assertions verify both footer links, escaped conditional identity/email, no form/script on Privacy, its noindex/sitemap exclusion even with complete fixture data, and truthful missing-contact text. Both outputs restored to private unconfigured builds. No fixture email or public origin remains in output.
- `npm run verify:links`: **passed**, all 15 HTML pages checked for metadata, unique IDs, internal links and local assets.
- Main-agent browser QA: actual tile footer Privacy & data link reaches `/privacy/`; no horizontal overflow at 390 px or 1440 px. Reviewed truthful missing identity/contact/hosting status and noindex metadata. Screenshot saved as `verification/privacy-mobile.png`.
- Git status/log and diff verification are unavailable because this workspace is not a Git repository. No commit, push, deployment, external write, dependency change, manual server restart, additional server, worktree or persistent chat was created by this stage.

Handoff: local browser QA is complete. Real operator identity, working contact ownership, public deployment, providers/settings and actual data uses/access/retention/processing locations are prerequisites for stage 13 completion. Keep the privacy draft gate until those facts are reflected in the page; later search/ad/consent stages must not claim inactive services are running or change this gate merely because an account value exists.

## Stage 14 — Search Console preparation

Implementation: local optional verification configuration and operations handoff implemented. **BLOCKED: approved live domains, authorized Search Console account access, actual ownership verification and sitemap submission evidence have not been supplied.** The external completion criterion is not satisfied. No connection, submission, indexing, impressions or clicks are claimed.

- Added optional `BRAND_GOOGLE_SITE_VERIFICATION` and `TILE_GOOGLE_SITE_VERIFICATION` process environment fields. Each is validated separately, requires its own configured public origin and renders only in that app's homepage head through a normal Astro attribute. Full tags, DNS records, controls and markup/attribute injection are rejected. The supported static Astro config pattern remains unchanged. Format checks cannot establish account ownership; no real verification marker is stored.
- Preserved unconfigured noindex/robots-disallow/no-sitemap output and all existing About, Contact and Privacy indexing gates. Verification metadata does not certify publication or privacy readiness. No analytics, database, tracking script or external account integration was added.
- README now distinguishes DNS-verified Domain properties from URL-prefix HTML tags and documents the actual per-site `/sitemap-index.xml` submission paths, live checks, required ownership/submission evidence and Performance report use. Consulted current official Google property, verification, sitemap and Performance documentation on 2026-09-27. No account login, DNS change, deployment or submission was performed.

Verification run on 2026-09-27:

- `npm test`: **98 passed** (57 brand/config/contact/data tests and 41 tile tests). Added optional-value, per-site separation, matching-origin prerequisite and malformed/HTML-injecting value rejection cases.
- `npm run check`: **0 errors, 0 warnings, 0 hints** in both workspaces.
- `npm run build`: **passed**, six brand and nine tile HTML pages plus existing endpoints.
- `npm run verify:sites`: **passed**. Reserved local fixtures confirmed distinct single homepage head tags; no tags on other pages; no tags when values are absent even with origins; sitemap indexes pointing to their own child files; exact equality between sitemap URLs and built indexable canonical pages; existing noindex exclusions. Restored both private outputs without fixture values or public/development origins.
- `npm run verify:links`: **passed**, all 15 HTML pages checked. No visual UI changed; any browser review belongs to the main agent. Live HTTP availability, actual Google ownership/submission and search results remain unverified.
- Git status/log and diff verification are unavailable because this workspace has no Git repository. No commit, push, deployment, external write, dependency change, additional preview server, manual server restart, worktree or persistent chat was created.

Handoff: preserve the fail-closed defaults in subsequent stages. Completion requires the actual approved origins, authorized operator action and dated ownership/submission evidence for both sites, plus live canonical/robots/sitemap checks. Existing identity/contact/privacy publication prerequisites remain unresolved.

## Stage 15 — AdSense connection preparation

Implementation: optional local publisher metadata and ads.txt generation implemented. **BLOCKED: actual publisher ID, authorized AdSense account access, approved public domains/deployment and verification/review-request evidence are absent.** No site connection, review request, approval or advertising activation is claimed.

- One optional `ADSENSE_PUBLISHER_ID` accepts only `pub-` plus 16 ASCII digits, trims spaces and rejects controls, markup, product prefixes and malformed values. It requires both configured public origins and represents the same directly controlled account on both sites. Syntax cannot prove ownership; no real account information is stored. Missing values generate no publisher metadata or ads.txt.
- Both static Astro configurations preserve their supported object form. The shared build-only integration writes each configured output's exact Google seller line to `dist/ads.txt`; each homepage alone renders the corresponding `google-adsense-account` meta tag. No advertisement script, slot, automatic-ad setting, network call, account action or dependency was added. Default private output, optional Search Console metadata and all About/Contact/Privacy indexing gates remain intact.
- Checked current official Google meta verification, site-scope and ads.txt guidance on 2026-09-27. README documents ordinary root/subdomain site management, the requirement for root-domain ads.txt discovery, HTTP/HTTPS and crawl checks, referral requirements when sellers differ, and the actual account evidence needed for completion. There is no guessed registrable-domain parsing, fabricated referral, DNS change or root-domain redirect. Root coverage remains unverified even if a subdomain build contains ads.txt.
- Local readiness review inspected the four distinct guides, original worked calculations, generated layout diagrams, tool routes and representative project detail. Existing checks verify reproducible examples and navigation/assets across 15 HTML pages; no empty article, future-project card or inert `href="#"` was found. This does not certify Google acceptance or establish an article-count threshold. Actual operator identity and working contact remain absent, Privacy is deliberately incomplete/noindex, public reachability is unverified, and default robots blocks crawling. These unresolved requirements prevent a readiness or submission claim.

Verification run on 2026-09-27:

- Focused publisher tests: **14 passed**, covering optional absence, exact format, shared value, existing identity/contact incompleteness and public-origin prerequisites without development fallback.
- `npm test`: **112 passed** (71 brand/config/contact/project tests, 41 tile tests).
- `npm run check`: **0 errors, 0 warnings, 0 hints** in both apps.
- `npm run verify:sites`: **passed**, including both configured and unconfigured builds. Verified exact ads.txt seller line, homepage-only head metadata, no ad activation, optional absence even with origins, sitemap/canonical checks and existing indexing gates. A documented Google placeholder ID was used only inside local tests and restored outputs contain no publisher ID/tag or ads.txt.
- `npm run verify:links`: **passed**, all 15 HTML pages. A final output search also found no publisher fixture, ad metadata or ad-script identifiers. No visible UI changed; no browser session or server action was needed.
- Git status/log and diff verification remain unavailable because this directory has no Git repository. No commit, push, deployment, external write, global change, dependency change, server launch/restart, worktree or persistent chat was performed.

Handoff: keep stage 15 blocked until the authorized operator supplies actual account/domain details, prior publication prerequisites are satisfied, and live verification plus the review request are evidenced. Review submission and approval must be recorded separately. Later consent/advertising work must preserve the current non-advertising state until its own real prerequisites are satisfied; a publisher ID alone is not approval.

## Stage 16 — Consent prerequisites and inactive-state verification

Implementation: local source/output review and official-source handoff complete. **BLOCKED: real account access, selected certified CMP, account-generated integration, approved domains, regional processing decisions and working consent-flow evidence are absent.** No CMP is installed and no consent flow is claimed complete.

- README now links current official Google guidance for certified CMP requirements in the EEA/UK/Switzerland, actual European message configuration, US partners/GPP/RDP settings, revocation and testing. It distinguishes forced message previews from regional targeting and lists the evidence needed for accept/refuse/change/revoke, return visits and CMP failure while keeping both tools usable without advertising consent.
- No speculative runtime scaffolding, custom banner, consent storage, inert settings action, invented publisher integration or ad loader was added. Stage 15 metadata and ads.txt cannot display Google messages. Real Google message integration requires account configuration and AdSense code; its automatic revocation link also depends on approval. Those remain prerequisites rather than presumed features.
- Privacy was inspected and remains truthful: no advertising, analytics or CMP is currently implemented; calculation does not require consent. Its incomplete/noindex gate remains. No user-facing runtime or styling changed.

Verification run on 2026-09-27:

- Read-only Node static audit: **passed** across 15 built HTML pages, 3 built JS bundles and 15 source script/module blocks. No checked ad/analytics/CMP markers, remote executable/media/style subresources, iframes or browser fetch/XHR/beacon/socket/cookie/storage API usage in executable code. The audit separated descriptive Privacy text from script bodies. This does not prove live network behavior or future CMP handling.
- `npm run verify:links`: **passed**, all 15 built HTML pages across both sites.
- Only README and this status document changed. Existing builds and the prior stage's passing test/typecheck/configuration results were not regenerated or represented as new runs. Real regional/browser consent testing is unavailable without the actual CMP/account/publication prerequisites.
- Git inspection is unavailable because the directory has no Git repository. No commit, push, deployment, external write, account configuration, dependency/global change or server restart occurred.

Handoff: stage 16 remains incomplete. Supply the real integration and approved processing choices, resolve publication/privacy prerequisites, then verify actual consent behavior and document it before declaring completion. This stage does not authorize stage 17 activation.

## Stage 17 — Final advertising entry audit

Implementation: independent local entry audit complete. **BLOCKED before entry: actual AdSense site approval and verified certified-CMP integration/consent behavior are absent.** Advertising has not been configured, activated or observed. No approval flag, fabricated account/unit, placeholder placement or consent implementation was added.

- Inspected both shared layouts, build-only ads.txt integration and calculator/layout event handlers. Publisher configuration only produces optional metadata/ads.txt. Tool input, unit, reset, orientation and start-point events update calculations, diagrams and local navigation; no ad loader, slot creation or refresh path exists. Existing ad-free UI and prior desktop/mobile usability evidence remain applicable; runtime code/styles were unchanged.
- Closed a specific verification gap in `scripts/verify-static.mjs`: the existing `verify:links` command now checks compiled JS files as well as executable/resource HTML for known ad activation markers. It does not reject informational prose or optional publisher metadata. This is a narrow regression guard, not proof of live network behavior or future consent correctness.
- README records actual account/site approval, real units/settings, both-origin regional consent acceptance evidence and existing publication/privacy requirements needed before activation. Future live checks must separately record configuration/loading and observed impressions, confirm no-fill/blocked/failure usability and no input-triggered refresh, and avoid clicking live ads.

Verification run on 2026-09-27:

- `npm run verify:links`: **passed**, 15 built HTML pages and 3 compiled JS files across both sites, including the new inactivity guard.
- `node --check scripts/verify-static.mjs`: **passed**.
- A temporary, unreferenced built JS fixture containing an ad activation identifier correctly made the verifier fail. Removed only that exact fixture in `finally`; the clean 15-page/3-script verification then **passed** again. No fixture remains.
- No runtime/configuration changes required new builds or broad test reruns. The prior stage 15 results (112 tests, both workspace checks, configured/default builds) remain historical verification, not new runs. Actual approval, live ad loading/impressions and consent behavior cannot be verified without the real account/integration/publication prerequisites.
- Git status/log/diff remain unavailable because this directory has no Git repository. No commit, push, deployment, external write, dependency/global change or server start/restart occurred. Both existing development servers were left untouched. Stages 18/19 were not started.

Handoff: stage 17 remains incomplete. Preserve the current inactive state until real approval and stage 16 evidence exist; a publisher ID or successful review submission is insufficient. All currently possible local work in this stage is complete.
