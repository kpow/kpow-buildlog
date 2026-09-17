# kpow-buildlog

Source of truth for the **build log** on [kpow.xyz](https://kpow.xyz). Plain
Markdown + committed web-sized images. **No database** — the site is generated
from this repo at build time, so nothing here can be "lost in a DB." If the site
disappears, one command rebuilds it from these files.

## Structure

```
builds/
  <slug>/
    build.md            # the wiki page: frontmatter + evergreen description
    log/
      YYYY-MM-DD.md      # a dated devlog entry (append-only, never rewritten)
    media/
      *.jpg              # web-sized images (~1600px), committed to the repo
scripts/
  build-buildlog.mjs     # parses everything → builds.json (no deps)
builds.json              # generated artifact the site renders from
```

## Frontmatter

`build.md`:
```yaml
slug: noodle
title: NoodleLab v2
status: active            # active | shipped | shelved
summary: One-liner.
stack: [ESP32-S3, ESP-NOW, FastLED]
tags: [led, firmware]
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/noodlez-v2 }
started: 2026-03-23
```

`log/2026-05-27.md`:
```yaml
date: 2026-05-27
title: What happened today
tags: [satellites]
media:
  - { src: media/disco-skull.jpg, caption: "Skull over the spinning ball" }
```
Body (below the `---`) is Markdown.

## Publish pipeline (no DB)

```
markdown + images  ──►  node scripts/build-buildlog.mjs  ──►  builds.json  ──►  React renders
```

`builds.json` gives the site three views from two files:
- **builds index** (wiki), **build page** (build + entries newest-first),
  **/recently** (all entries across builds, reverse-chron).

### Wiring into kpow_v3
1. Add this repo to `kpow_v3` as a **git submodule** (or clone it in a prebuild).
2. Run `scripts/build-buildlog.mjs` during the site build, writing `builds.json`
   into the client's `public/` and copying `builds/*/media` → `public/buildlog/<slug>/`.
3. A React section reads `builds.json` (media served from `/buildlog/<slug>/…`).
4. A GitHub Action here triggers a DigitalOcean redeploy on push, so
   **push to this repo → site republishes.** No DB, no admin panel.

## Daily workflow

1. Drop the day's photos in; agent resizes them into `builds/<slug>/media/`.
2. Agent writes `builds/<slug>/log/<today>.md` from a sentence or two.
3. Commit + push. Site rebuilds.

Two minutes, and the git history is itself a permanent record of the work.
