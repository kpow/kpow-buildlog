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
    if (/src:/.test(e.fm) && !/caption:\s*\S/.test(e.fm)) warn(where, "media without a caption");
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
