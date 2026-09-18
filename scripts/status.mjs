#!/usr/bin/env node
// status.mjs — where the build log stands, at a glance.
//
//   node scripts/status.mjs          # table
//   node scripts/status.mjs --json   # same data, for tooling
//
// For each build: status, last devlog entry, and how many commits have landed in
// its source repo since then (work that hasn't been logged yet). Source repos are
// found by matching build.md's `repo:` against the origin remote of checkouts
// under BUILDLOG_PROJECTS (default ~/projects), so there's no mapping to maintain.

import { existsSync, readdirSync } from "node:fs";
import { commitsBetween, git, INBOX, readBuild, ROOT, slugs, sourceFor } from "./sources.mjs";

const daysSince = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor((Date.now() - new Date(y, m - 1, d)) / 86400000);
};

const rows = slugs().map((slug) => {
  const { entries, repo, title, status } = readBuild(slug);
  const last = entries.at(-1)?.date || null;
  const source = sourceFor(repo);
  const unlogged = source ? commitsBetween(source, last, null) : null;
  return {
    slug,
    title,
    status,
    entries: entries.length,
    lastEntry: last,
    daysSince: daysSince(last),
    repo,
    source,
    lastCommit: source ? git(source, ["log", "--all", "-1", "--format=%cs"]) || null : null,
    unlogged: unlogged ? unlogged.length : null,
  };
});

const inbox = existsSync(INBOX)
  ? readdirSync(INBOX).filter((f) => !f.startsWith(".") && f !== "README.md")
  : [];
const ahead = Number(git(ROOT, ["rev-list", "--count", "@{u}..HEAD"]) || 0);
const dirty = git(ROOT, ["status", "--porcelain"]).split("\n").filter(Boolean).length;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ builds: rows, inbox, unpushedCommits: ahead, uncommittedFiles: dirty }, null, 2));
  process.exit(0);
}

const pad = (s, n) => String(s ?? "—").padEnd(n);
console.log(`${pad("build", 14)}${pad("status", 9)}${pad("entries", 9)}${pad("last entry", 13)}${pad("days", 6)}unlogged commits`);
for (const r of rows.sort((a, b) => (b.lastEntry || "").localeCompare(a.lastEntry || ""))) {
  const unlogged =
    r.source == null
      ? r.repo ? `? no local checkout of ${r.repo}` : "— no repo"
      : r.unlogged === 0 ? "0" : `${r.unlogged}  (latest ${r.lastCommit})`;
  console.log(`${pad(r.slug, 14)}${pad(r.status, 9)}${pad(r.entries, 9)}${pad(r.lastEntry, 13)}${pad(r.daysSince, 6)}${unlogged}`);
}
console.log("");
console.log(`inbox: ${inbox.length} file${inbox.length === 1 ? "" : "s"}${inbox.length ? "  — " + inbox.slice(0, 4).join(", ") + (inbox.length > 4 ? ", …" : "") : ""}`);
console.log(`content repo: ${ahead} unpushed commit${ahead === 1 ? "" : "s"}, ${dirty} uncommitted file${dirty === 1 ? "" : "s"}`);
