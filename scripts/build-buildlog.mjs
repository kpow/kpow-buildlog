#!/usr/bin/env node
// build-buildlog.mjs — parse the markdown content repo into a single builds.json.
// No database. Run at build time; the site renders from the JSON.
//
//   node scripts/build-buildlog.mjs [contentRoot] [outFile]
//   defaults: contentRoot=./builds  outFile=./builds.json
//
// Emits, per build: frontmatter fields + derived { stats, picturesOverTime }.
// `git` is left null; a separate step can fill it from the GitHub API using the
// build's `repo` field (owner/name). Media are served from /buildlog/<slug>/<rel>.
// For production robustness swap the tiny frontmatter parser for gray-matter+js-yaml.

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const CONTENT = process.argv[2] || "./builds";
const OUT = process.argv[3] || "./builds.json";

function splitFront(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw.trim() };
  return { data: parseYaml(m[1]), body: m[2].trim() };
}
function stripQ(s) { return s.trim().replace(/^["']|["']$/g, ""); }
function parseInline(objStr) {
  const inner = objStr.trim().replace(/^\{|\}$/g, "");
  const parts = []; let cur = "", q = null;
  for (const ch of inner) {
    if (q) { if (ch === q) q = null; cur += ch; }
    else if (ch === '"' || ch === "'") { q = ch; cur += ch; }
    else if (ch === ",") { parts.push(cur); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  const o = {};
  for (const p of parts) { const i = p.indexOf(":"); if (i < 0) continue;
    o[p.slice(0, i).trim()] = stripQ(p.slice(i + 1)); }
  return o;
}
function parseYaml(txt) {
  const data = {}; const lines = txt.split("\n"); let key = null; let nested = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && key) {
      const v = listItem[1].trim();
      data[key] = Array.isArray(data[key]) ? data[key] : [];
      data[key].push(v.startsWith("{") ? parseInline(v) : stripQ(v));
      continue;
    }
    const nestedKv = line.match(/^\s{2,}([A-Za-z0-9_]+):\s*(.*)$/);
    if (nestedKv && nested) { nested.obj[nestedKv[1]] = stripQ(nestedKv[2]); continue; }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1]; let val = kv[2];
    if (val === "") { data[key] = {}; nested = { key, obj: data[key] }; }   // nested map OR list
    else if (val === "[]") { data[key] = []; nested = null; }
    else if (val.startsWith("[")) { data[key] = val.replace(/^\[|\]$/g, "").split(",").map(stripQ).filter(Boolean); nested = null; }
    else { data[key] = stripQ(val); key = null; nested = null; }
  }
  // a "key:" with only "- items" underneath became {} then got array-filled; leave as-is
  return data;
}

function rewriteMedia(slug, arr) {
  return (arr || []).map((m) => ({
    ...m,
    src: `/buildlog/${slug}/${m.src}`,
    ...(m.poster ? { poster: `/buildlog/${slug}/${m.poster}` } : {}),
  }));
}
function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / 86400000) + 1;
}

const builds = [];
for (const slug of readdirSync(CONTENT)) {
  const dir = join(CONTENT, slug);
  if (!statSync(dir).isDirectory()) continue;
  const buildFile = join(dir, "build.md");
  if (!existsSync(buildFile)) continue;

  const { data, body } = splitFront(readFileSync(buildFile, "utf8"));
  const entries = [];
  const logDir = join(dir, "log");
  if (existsSync(logDir)) {
    for (const f of readdirSync(logDir).filter((f) => f.endsWith(".md"))) {
      const e = splitFront(readFileSync(join(logDir, f), "utf8"));
      entries.push({
        date: e.data.date || basename(f, ".md"),
        title: e.data.title || "",
        tags: Array.isArray(e.data.tags) ? e.data.tags : [],
        media: rewriteMedia(slug, e.data.media),
        body: e.body,
      });
    }
  }
  entries.sort((a, b) => b.date.localeCompare(a.date));

  const dates = entries.map((e) => e.date).sort();
  const firstEntry = dates[0] || data.started || null;
  const lastEntry = dates[dates.length - 1] || data.started || null;
  const photos = entries.reduce((n, e) => n + e.media.length, 0);
  const picturesOverTime = entries
    .flatMap((e) => e.media.map((m) => ({ date: e.date, ...m })))
    .sort((a, b) => a.date.localeCompare(b.date));

  builds.push({
    slug: data.slug || slug,
    title: data.title || slug,
    status: data.status || "active",
    kind: data.kind || "hardware",
    summary: data.summary || "",
    stack: Array.isArray(data.stack) ? data.stack : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    rung: data.rung || null,
    facts: data.facts || {},            // build-specific stat chips, e.g. { satellites: 7 }
    repo: data.repo || null,            // owner/name — for the git fetch step
    hero: data.hero ? `/buildlog/${slug}/${data.hero}` : null,
    links: Array.isArray(data.links) ? data.links : [],
    started: data.started || null,
    body,
    stats: {
      entries: entries.length,
      photos,
      daysActive: daysBetween(data.started || firstEntry, lastEntry),
      firstEntry, lastEntry,
    },
    git: null,                          // filled by a later GitHub-API step if repo set
    picturesOverTime,
    lastEntry,
    entries,
  });
}
builds.sort((a, b) => (b.lastEntry || "").localeCompare(a.lastEntry || ""));

const recent = builds
  .flatMap((b) => b.entries.map((e) => ({ build: b.slug, buildTitle: b.title, ...e })))
  .sort((a, b) => b.date.localeCompare(a.date));

writeFileSync(OUT, JSON.stringify({ builds, recent, generatedAt: new Date().toISOString() }, null, 2));
console.log(`wrote ${OUT}: ${builds.length} builds, ${recent.length} log entries`);
