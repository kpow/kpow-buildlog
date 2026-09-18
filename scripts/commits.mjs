#!/usr/bin/env node
// commits.mjs — line a build's devlog up against its source repo's history.
//
//   node scripts/commits.mjs <slug>                 # every entry + the commits behind it
//   node scripts/commits.mjs <slug> --since <date>  # just commits after <date>
//
// Each entry is shown with the commits that landed after the previous entry, up
// to and including its own date. An entry with none behind it is flagged: it's
// either work that lives in another repo, or a claim worth checking. Commits
// after the newest entry are listed last as UNLOGGED.

import { commitsBetween, readBuild, slugs, sourceFor } from "./sources.mjs";

const [slug, flag, since] = process.argv.slice(2);
if (!slug || !slugs().includes(slug)) {
  console.error(`usage: commits.mjs <slug> [--since YYYY-MM-DD]\nbuilds: ${slugs().join(", ")}`);
  process.exit(2);
}

const { entries, repo } = readBuild(slug);
const source = sourceFor(repo);
if (!source) {
  console.error(repo ? `no local checkout of ${repo} under ~/projects` : `${slug} has no repo: in build.md`);
  process.exit(1);
}
console.log(`${slug} <- ${repo} (${source})\n`);

if (flag === "--since") {
  const list = commitsBetween(source, since || null, null);
  console.log(list.length ? list.join("\n") : "(no commits)");
  process.exit(0);
}

// A day can hold two entries (YYYY-MM-DD-<word>.md); they share one window.
let prev = null;
for (let i = 0; i < entries.length; i++) {
  const e = entries[i];
  const sameDayAsPrev = i > 0 && entries[i - 1].date === e.date;
  const list = sameDayAsPrev ? [] : commitsBetween(source, prev, e.date);
  const mark = sameDayAsPrev ? "  (same window as above)" : list.length ? "" : "  ⚠ no commits behind this entry";
  console.log(`■ ${e.date}  ${e.title}  [${e.file}]${mark}`);
  for (const c of list) console.log(`    ${c}`);
  prev = e.date;
}

const unlogged = commitsBetween(source, prev, null);
console.log(`\n■ UNLOGGED (${unlogged.length})`);
for (const c of unlogged) console.log(`    ${c}`);
