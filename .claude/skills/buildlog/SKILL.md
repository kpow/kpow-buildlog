---
name: buildlog
description: Maintain the kpow.xyz build log — log a day's work on a build, start a new build, audit a build against its source repo, fix wrong content, and publish. Use when the user says "/buildlog", "log today's work", "add an entry", "new build", "the build log is wrong", "audit <build>", "fix <build>", "publish the build log", or drops photos in inbox/.
---

# buildlog

This repo is the content behind kpow.xyz/builds: markdown + photos, no database.
kpow_v3 clones it at build time and renders `builds.json`. Work in this repo only.

## Modes

| Command | Does |
|---|---|
| `/buildlog` | Status: every build, days since last entry, unlogged commits, inbox, unpushed work |
| `/buildlog log <slug> [what you did]` | Add entries for recent work — the everyday one |
| `/buildlog new <slug>` | Start a new build |
| `/buildlog audit <slug>` | Check a build against its source repo and photos; list what's off |
| `/buildlog fix <slug> <what's wrong>` | Correct existing content |
| `/buildlog publish` | Regenerate, commit, push, optionally redeploy the site |

No slug on `log`/`audit`/`fix`: run status and ask which build — one question.

## Tools (all zero-dependency, run from repo root)

```
node scripts/status.mjs                   # dashboard
node scripts/commits.mjs <slug>           # each entry + the source commits behind it; UNLOGGED at the end
node scripts/commits.mjs <slug> --since D # commits after date D
node scripts/photo.mjs info <files...>    # when each photo was taken, orientation, GPS?
node scripts/photo.mjs ingest <in> <out>  # resize 1600px, upright, ALL metadata stripped
node scripts/video.mjs info <files...>    # when each clip was shot, length, GPS?
node scripts/video.mjs ingest <in> <out.mp4>  # H.264 1280px, no audio, ALL metadata stripped, poster
node scripts/lint.mjs [slug]              # mechanical checks; must pass before publishing
node scripts/build-buildlog.mjs ./builds ./builds.json   # regenerate the site data
node scripts/redeploy.mjs                 # make kpow.xyz rebuild (asks first — see Publish)
```

Source repos are found automatically: build.md's `repo:` is matched against checkouts
under ~/projects. The photo archive is `../source-media/` — iPhone exports named
`YYYY-MM-DD HH.MM.SS.jpg`, so `ls ../source-media | grep '^2026-06-29'` finds a day's
photos. `IMG_*.HEIC` files aren't dated by name; use `photo.mjs info`.

## The one rule: never invent

Every claim in an entry must trace to one of: a commit (subject or diff), a photo, or
the user's own words this session. Commit messages say *what* changed; the user knows
*why* and *what it was like*. If a draft needs a detail you don't have — a number, a
reason, whether something worked — ask, or leave it out. A shorter true entry beats a
fuller made-up one. This is how the log got out of whack in the first place.

## log

1. `node scripts/commits.mjs <slug> --since <last entry date>` and list `inbox/`.
2. Group the commits into **chunks of work**, not one entry per commit. A chunk is what
   you'd tell a friend you did that day. Date each entry the day that work landed.
   Several days of small commits on one thing = one entry, dated its last day.
3. Photos: `photo.mjs info inbox/*`. Match each to an entry by the date it was taken.
   **Look at every photo** (Read it) before deciding whether it needs a caption at
   all — see "Captions are optional". Photos with no matching work day: ask.
4. Draft all entries at once and show them. If the user gave a sentence, it leads.
   Ask **one** question at a time about anything you can't source.
5. On approval: ingest photos (below), write the files, then **Publish**.

No commits and no photos? It's a hands-on day — ask what they did.

## new

1. Find the source: ask for the repo, confirm the checkout exists under ~/projects.
2. Read its README and `git log --reverse --format='%cs %s' | head -60` for the story.
3. Ask the user, in one message: one-line summary · status · hardware or software ·
   when it started. Offer your own guesses from the repo to confirm or correct.
4. Draft `build.md` (template below). The body is the evergreen description:
   what it is, how it works, why it's built that way. `## ` headings are fine.
5. Hero: best whole-project photo from inbox or `../source-media` → `media/hero.jpg`.
6. Backfill entries from history like `log`, then **Publish**.

## audit

The correction pass. Goal: a short list the user can say yes/no to.

1. `node scripts/lint.mjs <slug>`. Mechanical errors are findings.
2. `node scripts/commits.mjs <slug>`. For each entry, compare its claims to the commits
   in its window. `git -C <source> show --stat <hash>` when a subject is too vague.
3. `⚠ no commits behind this entry` is **not** automatically wrong — soldering, cases,
   and assembly don't make commits. Check `../source-media` for photos that day. No
   commits *and* no photos → ask the user whether it happened.
4. Check `build.md`: `status` still right? `facts:` numbers still true (grep the code —
   e.g. count the effects)? `summary` still accurate? `stack` complete?
5. Report **at most 5 findings per message**, worst first:
   `date · entry · what's off · evidence · proposed fix`. Then ask for go/no-go.
6. Apply what's approved via **fix**. Offer the next 5 if there are more.

## fix

Entries are append-only for *new* work — never rewrite an old entry to change what
happened. Fixing a *mistake* is the exception: wrong date, a claim that isn't true, a
bad caption, a broken format. Git history keeps the old version.

- Wrong date: `git mv` the file to the right date AND change its `date:`.
- Show a before/after for any change to entry text, then **Publish**.
- Something that never happened: delete the entry (ask first, name the file).

## Format — the parser is tiny, so be exact

`build.md`:
```
---
slug: radar
title: ESP32 Plane Radar
status: shipped            # active | shipped | live | shelved   (live = deployed software)
kind: hardware             # hardware | software
summary: A desktop ADS-B aircraft scope on a round LCD.
stack: [ESP32-C3, LovyanGFX, ADS-B, PlatformIO]
tags: [display, adsb, firmware]
rung: solder               # leave existing values alone; don't invent one
repo: kpow/ESP32-Plane-Radar
facts:
  aircraft: 64             # 0-4 stat chips; must be true and checkable
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/ESP32-Plane-Radar }
started: 2026-06-13
---

Evergreen markdown body.
```

`log/YYYY-MM-DD.md` (a second entry the same day: `YYYY-MM-DD-<word>.md`):
```
---
date: 2026-05-27
title: "Disco-ball satellite — and a nasty ground-noise lesson"
tags: [satellites, disco, hardware-lesson]
media:
  - { src: media/disco-skull.jpg }
---
Body.
```
Text-only entry: `media: []`.

Video entry — `src:` the ingested .mp4, `poster:` a .jpg shown before it plays:
```
  - { src: media/matrix-yellow-cross.mp4, poster: media/matrix-yellow-cross.jpg }
```

A still that isn't a photo says so with `kind:` — `render`, `screenshot` or
`diagram`. Video needs no flag; the site badges it off the `.mp4`.
```
  - { src: media/mobile-version-cad.jpg, kind: render, caption: "The mobile version" }
```

### Captions are optional, and usually wrong

**A caption carries something the photo can't: a number, a part name, a
failure.** "44 icons cached, last synced 52 seconds ago" earns its place.
"Three printed case bodies on the mat" does not — the reader has eyes.

- Nothing to add? **Omit the `caption:` key.** Don't write `caption: ""`.
- Never describe the frame, and never restate a sentence from the body. That
  duplication was half of what made the log read like filler.
- Never write "(video)" or "(render)" into caption text. The site draws a badge.
- Keep one under 90 characters; lint warns past that.

- `---` on **line 1**, LF endings.
- `date:` must equal the filename's date.
- Quote titles and captions with `"…"`. Never `\"` inside — it shows up literally.
  If the text contains `"`, wrap it in single quotes: `title: 'The 7" touch build'`.
- `[a, b]` lists split on commas: no commas or quotes inside items.
- Captions can't contain `}`.
- `src:` and `poster:` are relative to the build folder: `media/<name>.jpg` / `.mp4`.

### Body markdown

CommonMark plus GFM — tables, strikethrough, task lists, autolinks all parse, and
`builds.json` carries the body through untouched.

- **Blank line before every list, heading, table, callout and fence.** A `- ` line
  can otherwise interrupt a paragraph and swallow it.
- **`***` for a horizontal rule, never `---`.** Directly under a text line, `---`
  is a setext H2.
- No raw HTML; it is dropped, not rendered.
- Tables need a header row. Three columns maximum, short cells — an entry body is
  about 300px wide on a phone.
- Links open in a new tab on their own. Don't write the target.

## Voice and shape

Shape follows the content. Most entries are 2–4 short paragraphs (40–140 words),
and the structure varies because the days varied. A one-paragraph entry is still
right when the day was one thing.

- **A list** when there are 3+ parallel items: things fixed, parts swapped,
  options weighed. Lead with a bolded noun label when the items have names —
  `- **FC16 module:** …` — the renderer styles that first bold run.
- **A callout**, at most one per entry, for the thing worth shouting at your past
  self: `> **Trap:**`, `> **Lesson:**`, `> **Dead end:**`, `> **Note:**`,
  `> **Next:**`. Colon inside the bold. No hard-won lesson, no callout.
- **A table** only for genuinely tabular facts: settings vs results, before and
  after, board vs board. Four columns of prose is a design failure, not a table.
- **Headings** belong in `build.md` bodies and long entries. A 60-word entry with
  a heading looks like a memo.
- **First person is earned.** Agentless past tense for plain work ("Swapped in an
  FC16 module"). "I" for mistakes, guesses, reversals and opinions ("I never
  actually use it", "until I noticed the tint was still on"). If the commit log
  knows it, drop the subject. If only you know it, say I.
- Name the real parts, chips and numbers. No marketing, no "excited to", no emoji.
- Title: short and specific, joins with `—`, `+`, `,` or `:`.
- Tags: 1–3, lowercase, kebab-case.
- Media says what it is through `kind:` and the badge, never in caption text.

### Banned tics — these are what made the log read like a machine

- **Comma-chained dumps.** Three or more clauses welded into one sentence with
  commas. Break them into a list or into sentences.
- **"Also …" / "Additionally …" tails** bolted on to cram in leftovers. If it
  matters, give it its own sentence; if it doesn't, cut it.
- **Stock editorialising closers**: "This is the backbone everything else hangs
  off", "Lesson learned", "A good reminder that…". Put the lesson in a callout in
  your own words or leave it out.
- **Em dashes: at most one per entry, zero preferred.** They were the loudest
  tell in the old log — 71 of them across 94 entries. Use a period or a colon.
- **Hedges**: "a bit", "somewhat", "fairly", "pretty much".
- **Repeating build.md in an entry.** If the evergreen body says it, link the
  reader's attention elsewhere.

## Photos and video

Anything off the phone is welcome in `inbox/` — .HEIC, .JPG, .PNG, .MOV, .MP4.
Always through `photo.mjs ingest` / `video.mjs ingest`, never copy a raw file into
`media/`. Raw phone photos and clips carry GPS and the creation date; the scripts
strip it and refuse to finish if any survives.

```
node scripts/photo.mjs ingest inbox/IMG_1234.HEIC builds/<slug>/media/<name>.jpg
node scripts/video.mjs ingest inbox/IMG_4180.MOV builds/<slug>/media/<name>.mp4
mkdir -p inbox/done && mv inbox/IMG_1234.HEIC inbox/IMG_4180.MOV inbox/done/
```
`video.mjs` also writes `media/<name>.jpg` from ~40% in as the poster, unless that
.jpg already exists (then it's kept). A still of the same clip already in `media/`
makes a better poster than a second copy — point `poster:` at it and delete an
unused auto-poster so lint has no orphans. **Watch clips** (pull frames with
ffmpeg and Read them) before captioning, same as photos.
`<name>`: short kebab-case description of what's in frame — `disco-skull`,
`hex-orb` — unique in that `media/`. Never delete originals; move them to `inbox/done/`.

## Safety

- Never publish credentials, WiFi names/passwords, IPs, MAC addresses, API keys or
  coordinates. ESP32-Plane-Radar and vizpow have hardcoded WiFi creds, home lat/lon
  and a fleet secret in their source — read their history for *what changed*, never
  quote config values.
- "Home" is fine; where home is, isn't.

## Publish

1. `node scripts/lint.mjs` — fix errors before going on.
2. `node scripts/build-buildlog.mjs ./builds ./builds.json`
3. `git add` the specific build folder(s) + `builds.json`; commit
   `<slug>: <what changed>` with the attribution line from the system prompt.
4. **Ask** before pushing: pushing makes it public on GitHub.
5. `git push`.
6. Pushing alone doesn't update kpow.xyz. **Ask**: "Redeploy the site now?" On yes:
   `node scripts/redeploy.mjs` (pushes an empty commit to kpow_v3 main, which
   triggers DigitalOcean). Batch it — once after a session of edits, not per entry.
7. Say what's now live in one line, e.g. "2 noodle entries + 3 photos are in; site
   rebuilds in ~5 min at kpow.xyz/builds/noodle".
