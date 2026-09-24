#!/usr/bin/env node
// lint.mjs — mechanical checks the tiny frontmatter parser won't catch for you.
//
//   node scripts/lint.mjs [slug...]     # all builds by default; exit 1 on errors
//
// Errors break what the site shows. Warnings are worth a look.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BUILDS, ENTRY_FILE, field, slugs } from "./sources.mjs";

const STATUSES = ["active", "shipped", "live", "shelved"];
const KINDS = ["hardware", "software"];
const problems = [];
const err = (where, msg) => problems.push({ level: "error", where, msg });
const warn = (where, msg) => problems.push({ level: "warn", where, msg });

function front(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2].trim() } : null;
}

function checkCommon(where, fm) {
  if (/\\"/.test(fm)) err(where, `escaped quote \\" shows up literally on the site — wrap the value in single quotes instead`);
  if (/\r/.test(fm)) err(where, "CRLF line endings — the parser expects LF");
  for (const line of fm.split("\n")) {
    const inline = line.match(/^(tags|stack):\s*\[(.*)\]\s*$/);
    if (inline && /["']/.test(inline[2])) warn(where, `${inline[1]} items are split on commas; quotes inside [] are kept literally`);
  }
}

// src: and poster: both point at files in the build folder. src may be a
// photo (.jpg) or a video (.mp4, ingested through video.mjs).
function mediaRefs(fm, key = "src") {
  return [...fm.matchAll(new RegExp(`\\b${key}:\\s*["']?([^,"'}\\s]+)`, "g"))].map((m) => m[1]);
}
const MEDIA_EXT = /\.(jpe?g|png|webp|gif|mp4|webm)$/i;
const VIDEO_EXT = /\.(mp4|webm)$/i;
// kind: tells the site to badge a still. Video badges itself off the extension,
// so kind: video is a second source of truth and is rejected.
const MEDIA_KINDS = ["render", "screenshot", "diagram"];
const CAPTION_MAX = 90;

/** Every entry under `media:`, as { raw, inline }. `inline` means it sat on the
 *  `media:` line itself — the `[]` and the legacy `[a, b]` forms. Mirrors how
 *  parseYaml in build-buildlog.mjs walks the same block. */
function mediaItems(fm) {
  const out = [];
  let inMedia = false;
  for (const line of fm.split("\n")) {
    const head = line.match(/^media:\s*(\S.*)?$/);
    if (head) { inMedia = true; if (head[1]) out.push({ raw: head[1].trim(), inline: true }); continue; }
    if (!inMedia) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item) { out.push({ raw: item[1].trim(), inline: false }); continue; }
    if (/^\S/.test(line)) inMedia = false;   // next top-level key
  }
  return out;
}

/** The caption text of one media item, or "" when it has none. */
function captionOf(raw) {
  const m = raw.match(/\bcaption:\s*(?:"([^"]*)"|'([^']*)'|([^,}]+))/);
  return (m?.[1] ?? m?.[2] ?? m?.[3] ?? "").trim();
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : slugs();

for (const slug of targets) {
  const dir = join(BUILDS, slug);
  const buildFile = join(dir, "build.md");
  if (!existsSync(buildFile)) { err(slug, "no build.md"); continue; }

  const raw = readFileSync(buildFile, "utf8");
  const b = front(raw);
  if (!b) { err(`${slug}/build.md`, "frontmatter must start on line 1 with --- and close with ---"); continue; }
  checkCommon(`${slug}/build.md`, b.fm);

  if (field(b.fm, "slug") && field(b.fm, "slug") !== slug) err(`${slug}/build.md`, `slug: ${field(b.fm, "slug")} doesn't match the folder name`);
  for (const key of ["title", "status", "summary"]) if (!field(b.fm, key)) err(`${slug}/build.md`, `missing ${key}:`);
  const status = field(b.fm, "status");
  if (status && !STATUSES.includes(status)) err(`${slug}/build.md`, `status: ${status} — use ${STATUSES.join(" | ")}`);
  const kind = field(b.fm, "kind");
  if (kind && !KINDS.includes(kind)) err(`${slug}/build.md`, `kind: ${kind} — use ${KINDS.join(" | ")}`);
  const hero = field(b.fm, "hero");
  if (!hero) warn(`${slug}/build.md`, "no hero: — the index card and build page show an empty band");
  else if (!existsSync(join(dir, hero))) err(`${slug}/build.md`, `hero ${hero} doesn't exist`);
  if (!b.body) warn(`${slug}/build.md`, "empty body — Project Info has no description");

  const used = new Set(hero ? [hero] : []);
  const logDir = join(dir, "log");
  const files = existsSync(logDir) ? readdirSync(logDir).filter((f) => f.endsWith(".md")).sort() : [];

  for (const f of files) {
    const where = `${slug}/log/${f}`;
    const name = f.match(ENTRY_FILE);
    if (!name) { err(where, "filename must be YYYY-MM-DD.md or YYYY-MM-DD-<word>.md"); continue; }
    const e = front(readFileSync(join(logDir, f), "utf8"));
    if (!e) { err(where, "frontmatter must start on line 1 with --- and close with ---"); continue; }
    checkCommon(where, e.fm);

    const date = field(e.fm, "date");
    if (!date) err(where, "missing date:");
    else if (date !== name[1]) err(where, `date: ${date} doesn't match the filename`);
    if (!field(e.fm, "title")) err(where, "missing title:");
    if (!e.body) err(where, "empty body");
    if (!/^tags:/m.test(e.fm)) warn(where, "no tags:");

    for (const src of mediaRefs(e.fm)) {
      used.add(src);
      if (!existsSync(join(dir, src))) err(where, `media ${src} doesn't exist`);
      if (!MEDIA_EXT.test(src)) err(where, `media ${src} — raw clips/photos don't play on the site; ingest with video.mjs / photo.mjs`);
    }
    for (const poster of mediaRefs(e.fm, "poster")) {
      used.add(poster);
      if (!existsSync(join(dir, poster))) err(where, `poster ${poster} doesn't exist`);
    }
    for (const line of e.fm.split("\n")) {
      const src = mediaRefs(line)[0];
      if (src && VIDEO_EXT.test(src) && !/\bposter:/.test(line)) warn(where, `video ${src} has no poster: — shows a blank frame until it loads`);
    }
    // A caption is optional now: it earns its place by carrying a fact the photo
    // can't. What the site cannot survive is a malformed item.
    for (const it of mediaItems(e.fm)) {
      if (it.inline) {
        if (it.raw !== "[]") err(where, `media: ${it.raw} — a bare list builds src: .../undefined and a broken image; use "- { src: media/x.jpg }" lines`);
        continue;
      }
      if (!it.raw.startsWith("{")) { err(where, `media item "${it.raw}" must be an inline object: - { src: media/x.jpg }`); continue; }
      if (!/\bsrc:/.test(it.raw)) err(where, `media item "${it.raw}" has no src:`);

      const kind = it.raw.match(/\bkind:\s*([A-Za-z-]+)/)?.[1];
      if (kind && !MEDIA_KINDS.includes(kind)) err(where, `kind: ${kind} — use ${MEDIA_KINDS.join(" | ")} (video badges itself from the .mp4)`);

      const caption = captionOf(it.raw);
      if (caption.length > CAPTION_MAX) warn(where, `caption is ${caption.length} chars — trim it to the fact, or drop it if the photo already says it`);
      if (/^\((video|render|screenshot)\)|\((video|render|screenshot)\)$/i.test(caption)) warn(where, `caption carries a "(…)" marker — the site badges media itself; use kind: or drop the marker`);
    }
  }

  const mediaDir = join(dir, "media");
  if (existsSync(mediaDir)) {
    for (const m of readdirSync(mediaDir)) {
      if (m.startsWith(".")) continue;
      if (!used.has(`media/${m}`)) warn(`${slug}/media/${m}`, "not used by any entry or the hero — delete it or attach it");
    }
  }
}

const errors = problems.filter((p) => p.level === "error");
for (const p of problems) console.log(`${p.level === "error" ? "✗" : "·"} ${p.where}: ${p.msg}`);
console.log(problems.length ? `\n${errors.length} error(s), ${problems.length - errors.length} warning(s)` : "clean");
process.exit(errors.length ? 1 : 0);
