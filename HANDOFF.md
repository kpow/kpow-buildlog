# Build Log — implementation handoff for Claude Code

This repo (`kpow-buildlog`) is the **content source of truth** for a new **Build Log**
section on kpow.xyz. The content, data pipeline, and design are done. Your job is to
**build the site rendering in `kpow_v3`** — routes, components, styling, and the build-time
ingest. Do **not** rewrite the content or the generator; render from what's here.

Read `README.md` first (content model + pipeline). This file is the design + integration spec.

---

## 0. What already exists (don't rebuild)

- `builds/<slug>/build.md` — 7 builds, wiki frontmatter + evergreen body.
- `builds/<slug>/log/YYYY-MM-DD.md` — 79 dated devlog entries total (append-only).
- `builds/<slug>/media/*.jpg` — web-sized images, committed.
- `scripts/build-buildlog.mjs` — zero-dependency generator: markdown → `builds.json`.
- `builds.json` — the generated artifact you render from (regenerate; don't hand-edit).
- `comps/design-b-light-photos.html` — **the approved design.** Self-contained, real photos.
  Open it in a browser — it is the visual source of truth. Match it.

The other `comps/design-*.html` are rejected alternates; ignore them except as reference.

---

## 1. Approved design (match `comps/design-b-light-photos.html`)

**Light mode**, dense, with a **gemtone-purple** highlight that is **scoped to this section only**
(the rest of kpow.xyz keeps its blue accent — see §5).

### Tokens
```
Surfaces   page #FAFAFA · panels #FFFFFF · ink #0A0A0A
Grays      #374151 · #6B7280 · #9CA3AF · borders #E5E7EB
Purple     primary/spine/nodes #5B21B6 · interactive/links/hover #7C3AED
           bright accent + halos #A855F7 · tint fill #F5F3FF · tint border #DDD6FE
Fonts      display: Slackey · body: Roboto · dates/meta: monospace (Roboto Mono / ui-monospace)
Title bars solid black #0A0A0A with white Slackey text (site signature — keep)
```
Status pills: solid purple on tint (`active`=filled #5B21B6; `shipped`/`live`/`shelved` may vary hue/weight but stay in the purple family + grays). Keep them readable in light mode.

### Layout rules (non-negotiable)
- **No bespoke header/footer.** The Build Log is page *content* that mounts **inside the existing
  kpow.xyz site layout** — the site's real header renders above it, the site footer below it.
  The nav strip shown in the comp is a placeholder for context only; do not ship it.
- **Reading column capped ~680px.** Page container ~1080px centered; the devlog text measure stays ≤680.
- **Dense** vertical rhythm — compact rows/chips/cards, no big empty hero.

### Sections on a build page (top → bottom), per the comp
1. Black **title bar** — build title (Slackey) + status pill + kind.
2. **Hero band** — `hero` image, cropped ~360px, `object-fit: cover`, purple hairline frame, caption.
3. **Project Info** — dense meta strip: `summary`, `stack[]` chips, `tags[]` chips, `stats`
   (entries / photos / daysActive / firstEntry–lastEntry), `facts{}` (e.g. satellites, effects),
   `started`, `links[]`. Render the evergreen `body` (markdown) once here.
4. **WIP Pix** — horizontal filmstrip / contact-sheet from `picturesOverTime[]`: each frame =
   thumbnail + monospace date + short caption; horizontal scroll on overflow.
5. **Devlog timeline** — purple spine down the left, a purple node dot per entry (soft purple halo).
   Each node: monospace date, bold title, `tags[]` chips, markdown body. Entries **with** `media`
   show the photo as a ~320–360px figure + caption; **text-only** entries show no image (this mix is
   intentional — don't fabricate images).
6. All photos (hero, filmstrip, timeline) open a shared **lightbox** (enlarged image + caption, close on click/Esc).

Build **index** page: tight multi-column grid of compact cards, each with its `hero` thumbnail,
title, status pill, kind, entry count — purple hover.

---

## 2. Routes

Slot these under the existing site layout / router (match kpow_v3's conventions):

| Route | View | Source |
|---|---|---|
| `/builds` | Index grid of all builds | `builds.json.builds[]` |
| `/builds/:slug` | Build page (title, hero, Project Info, WIP Pix, timeline) | `builds.json.builds[]` matched by `slug` |
| `/recently` | Cross-build feed, reverse-chron | `builds.json.recent[]` |

(Adjust path names to match existing site nav if there's a convention; keep the three views.)

---

## 3. Data contract — `builds.json`

Top level: `{ builds: [...], recent: [...], generatedAt: "ISO" }`

Each **build**:
```
slug, title, status(active|shipped|shelved|live), kind(hardware|software),
summary, stack[], tags[], rung, facts{ ...arbitrary key:value },
repo("owner/name"), hero("/buildlog/<slug>/media/x.jpg"),
links[{ label, url }], started("YYYY-MM-DD"), body(markdown string),
stats{ entries, photos, daysActive, firstEntry, lastEntry },
git(object|null — reserved for a future GitHub-API enrichment; treat as optional),
picturesOverTime[{ date, src, caption }],   // dated, media-bearing, chronological
lastEntry("YYYY-MM-DD"),
entries[{ date, title, tags[], body(markdown), media[{ src, caption }] }]  // newest-first
```
Each **recent** item is an entry flattened with its build: `{ build(slug), buildTitle, date, title, tags[], media[], body }`, newest-first across all builds.

**Media URLs are already rewritten** to `/buildlog/<slug>/<rel>` — serve them from there (§4). Don't re-derive paths.

Render `body` fields as **markdown** (they contain inline `code`, bold, etc.). Use the site's existing markdown renderer if it has one.

---

## 4. Build-time ingest (no DB)

0. **Get this repo onto GitHub yourself first** (it currently lives only on disk). Do it — don't ask the user to:
   - `cd kpow-buildlog && git init && git add -A && git commit -m "build log content + generator + design"`
   - Create the remote and push with the GitHub CLI: `gh repo create kpow/kpow-buildlog --private --source=. --push`
     (use `--public` only if the user says so; note the §7 secret flags before making anything public).
   - Confirm it's reachable, then wire it as a submodule below.
1. Add `kpow-buildlog` to `kpow_v3` as a **git submodule** (`git submodule add <url> kpow-buildlog`) — or shallow-clone in a prebuild step.
2. In the site build, before the client bundles:
   - `node scripts/build-buildlog.mjs ./builds ./builds.json`
   - copy `builds.json` → the client's `public/builds.json`
   - copy `builds/*/media/` → `public/buildlog/<slug>/media/` (so `/buildlog/<slug>/…` URLs resolve)
3. React section fetches `/builds.json` (or imports it at build) and renders the three views.
4. A GitHub Action in **this** repo pings DigitalOcean to redeploy on push → **push here = site republishes.**
   No admin panel, no database.

Images embedded in the comp are base64 for portability; **in production do NOT inline** — serve the
real files from `public/buildlog/<slug>/…`. The comp's `data-img` mechanism is a demo shim, not the prod path.

---

## 5. Section-scoped purple (important)

kpow.xyz's global accent is blue-600. The Build Log recolors to gemtone purple **only within the section**.
Do this with scoped CSS variables (e.g. a `.buildlog` wrapper that sets `--accent` etc.), **not** by
changing global site tokens. Nothing outside `/builds*` should change color.

---

## 6. Acceptance checklist

- [ ] `/builds`, `/builds/:slug`, `/recently` render inside the existing site header/footer (no bespoke chrome).
- [ ] Build page matches `comps/design-b-light-photos.html`: title bar, hero band, Project Info, WIP Pix, purple-spine timeline, index grid.
- [ ] Reading column ≤680px; container ~1080px; dense spacing.
- [ ] Purple is section-scoped; rest of site still blue.
- [ ] Photos served from `/buildlog/<slug>/…` (not base64); lightbox works.
- [ ] Text-only devlog entries render cleanly with no image slot.
- [ ] `node scripts/build-buildlog.mjs ./builds ./builds.json` runs in the build; push-to-repo republishes.
- [ ] Markdown in `body` fields renders (code/bold/etc.).

---

## 7. Known content flags (do not publish secrets)

Two builds reference repos that contain committed secrets — if you pull `repo` content or link to code,
**do not surface these**, and the repos should be scrubbed before any public linking:
- **ESP32-Plane-Radar** — hardcoded home WiFi SSID/password + real home lat/lon in `include/config.h`.
- **vizBot / vizPow** — one hardcoded `X-Bot-Secret` for the whole fleet + cleartext home WiFi in `poc_wled_text/`.

The build log text here is already clean; this only matters if you wire in live repo data.
