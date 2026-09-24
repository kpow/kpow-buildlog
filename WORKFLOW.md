# Build log workflow

How to keep kpow.xyz/builds current. Everything runs through one Claude Code
skill, `/buildlog`, opened in this folder.

## Quick start

```
cd ~/projects/kpow-music-makes-content/kpow-buildlog
claude
/buildlog
```

That prints every build, how many days since its last entry, and how many commits
haven't been logged yet. Pick one and go.

| You want to… | Run |
|---|---|
| See where everything stands | `/buildlog` |
| Log what you did | `/buildlog log <build>` |
| Check a build for mistakes | `/buildlog audit <build>` |
| Correct something specific | `/buildlog fix <build> <what's wrong>` |
| Start a new project | `/buildlog new <slug>` |
| Push changes live | `/buildlog publish` |

Builds: `noodle` · `kfun` · `vizbot` · `radar` · `phantasyfish` · `stackled` · `cyberdeck`

---

## 1. Logging work (the everyday one)

About 2 minutes.

1. **Photos** (optional): drop them in `inbox/`, straight off the phone.
2. Run `/buildlog log <build>`. Add a sentence if you like:
   `/buildlog log noodle got the disco ball spinning off its own supply`
3. Claude reads the build's source repo for commits since the last entry, matches
   photos to days by when they were taken, and drafts the entries.
4. **Correct the draft.** Claude asks one question at a time about anything it
   can't back up.
5. Say yes to publish, and yes to redeploy if you want it live now.

No commits and no photos (soldering, printing, assembly)? Claude asks what you did.

## 2. Getting existing content straight

Run the audit one build per sitting, about 10–15 minutes each.

1. `/buildlog audit <build>`
2. You get **up to 5 findings at a time**, worst first. Each one has what's off,
   the evidence, and a proposed fix.
3. Say yes or no to each one. Approved fixes get applied.
4. Repeat until it's clean, then publish.

What the audit checks:
- **Format:** things that render wrong on the site, like a literal `\"` in a title.
- **Entries against commits:** does the entry match what the repo shows happened?
- **Entries with no commits:** these are flagged, not assumed wrong. Hardware work
  doesn't make commits, so it checks `../source-media` for photos taken that day.
  No commits *and* no photos means it asks you.
- **build.md:** is the status still right, are the `facts` numbers still true, is
  the summary still accurate?

### Progress

Tick these off as you go. Suggested order: most suspect first.

- [ ] `cyberdeck`: 5 of 6 entries have no commits behind them; one `\"` title bug
- [ ] `vizbot`: 2 commits not yet logged
- [ ] `stackled`
- [ ] `radar`
- [ ] `phantasyfish`
- [ ] `kfun`
- [ ] `noodle`

## 3. Starting a new build

`/buildlog new <slug>`: pick a short, lowercase slug, e.g. `pendant`.

1. Claude asks which repo it lives in and reads its README and history.
2. You confirm or correct four things in one reply: a one-line summary, the status,
   hardware or software, and the start date.
3. Claude drafts the build page, picks a hero photo, and backfills entries from
   the repo history.
4. Review the draft, then publish.

Status values: `active` (working on it) · `shipped` (done, physical) ·
`live` (done, deployed software) · `shelved` (paused).

## 4. Publishing

`/buildlog publish`, or say yes at the end of any mode.

1. **Lint:** format checks, which must pass.
2. **Regenerate** `builds.json`.
3. **Commit** the changed build folders.
4. **Push.** Claude asks first, since this makes it public on GitHub.
5. **Redeploy.** Claude asks first. Pushing alone does **not** update kpow.xyz.
   Redeploy pushes an empty commit to `kpow_v3` main, and DigitalOcean rebuilds in
   about 5 minutes.

Do the redeploy once at the end of a session, not after every entry.

## Photos and video

- Put them in `inbox/`. HEIC, JPEG, PNG, screenshots, MOV and MP4 all work.
- **Every photo and clip is stripped of all metadata before it's committed.** Phone
  photos and videos carry GPS and the date; a raw one would publish where it was
  taken. The scripts refuse to finish if any metadata survives.
- Photos are resized to 1600px and turned upright (`photo.mjs`). Clips become a
  silent 1280px H.264 .mp4 plus a poster .jpg (`video.mjs`, uses ffmpeg — works
  on any OS). Never copy a raw clip into `media/`.
- A video entry is `{ src: media/<name>.mp4, poster: media/<name>.jpg, caption: "(video) …" }`.
  It plays muted and looping on the site; click opens it with controls.
- The originals move to `inbox/done/`. Clear that out whenever you like; nothing in
  `inbox/` is committed.
- Captions are optional and usually unnecessary: write one only when it carries
  something the photo can't (a number, a part name, a failure). Video and renders
  get a badge from the site, not a "(video)" in the text.

## The rules Claude follows

1. **Never invent.** Every claim traces to a commit, a photo, or something you
   said. If a detail can't be sourced, Claude asks or leaves it out.
2. **Entries are append-only.** New work gets a new entry. Old entries are only
   edited to fix mistakes: a wrong date, an untrue claim, a broken format.
3. **Match the voice.** Past tense, real part names, no hype. Shape follows the
   content: a list for parallel items, a `> **Trap:**` callout for a lesson worth
   keeping, a table for genuinely tabular facts. First person for mistakes and
   judgment calls, agentless for plain work. Full rules: "Voice and shape" in
   `.claude/skills/buildlog/SKILL.md`.
4. **No secrets.** No WiFi names or passwords, IPs, keys or coordinates. The radar
   and vizpow repos have hardcoded credentials in their source; entries describe
   what changed, never config values.

## Troubleshooting

| Message | Fix |
|---|---|
| `lint: escaped quote \"` | Wrap the value in single quotes: `title: 'The 7" build'` |
| `lint: date doesn't match the filename` | Rename the file or fix `date:` so they agree |
| `lint: media … doesn't exist` | The photo was never ingested, or its name is misspelled |
| `status: ? no local checkout of kpow/x` | Clone that repo somewhere under `~/projects` |
| `redeploy: unpushed commit(s)` | Push this repo first |
| `redeploy: kpow_v3 is on '<branch>'` | `git -C ~/projects/kpow_v3 checkout main` |
| `redeploy: staged changes` | Commit or unstage what's in progress in kpow_v3 first |
| `photo.mjs: metadata survived` | Don't commit it. Report the file; it's a bug in the script |
| `video.mjs: metadata survived` / `location atom survived` | Same: don't commit it, report the file |
| `lint: poster … doesn't exist` | The poster .jpg was deleted or misspelled |
| `lint: media … raw clips/photos don't play` | A .MOV/.HEIC went into `media/` raw; ingest it |

## Under the hood

```
inbox/ photos ──► photo.mjs ──► builds/<slug>/media/
inbox/ clips  ──► video.mjs ──► builds/<slug>/media/ (.mp4 + poster .jpg)
source repo commits ──► commits.mjs ──► drafted entries ──► builds/<slug>/log/
builds/ ──► build-buildlog.mjs ──► builds.json ──► git push
                                   redeploy.mjs ──► kpow_v3 rebuild ──► kpow.xyz/builds
```

| Script | Does |
|---|---|
| `scripts/status.mjs` | Dashboard |
| `scripts/commits.mjs <slug> [--since D]` | Each entry next to the source commits behind it |
| `scripts/photo.mjs info\|ingest` | Photo dates and GPS check / resize, orient, strip |
| `scripts/video.mjs info\|ingest` | Clip dates and GPS check / transcode, strip, poster (ffmpeg) |
| `scripts/lint.mjs [slug]` | Format checks |
| `scripts/build-buildlog.mjs` | Markdown → `builds.json` |
| `scripts/redeploy.mjs` | Triggers the site rebuild |

The full instructions Claude follows are in `.claude/skills/buildlog/SKILL.md`.
The content format is in `README.md`.
