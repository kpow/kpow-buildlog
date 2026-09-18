#!/usr/bin/env node
// redeploy.mjs — make kpow.xyz pick up freshly pushed build log content.
//
//   node scripts/redeploy.mjs
//
// The site bakes this repo in at build time, and DigitalOcean rebuilds kpow_v3 on
// every push to its main branch. So: push an empty commit to kpow_v3 main. It's
// the no-secrets stand-in for a GitHub Action that pings DigitalOcean directly
// (HANDOFF §4.4); swap it out once that exists.
//
// Refuses unless the site checkout is on main, has nothing staged (an empty
// commit would sweep it in), and is level with origin/main. Set KPOW_SITE if the
// checkout isn't at ~/projects/kpow_v3.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { git, ROOT } from "./sources.mjs";

const SITE = process.env.KPOW_SITE || join(homedir(), "projects", "kpow_v3");

function fail(msg) {
  console.error(`redeploy: ${msg}`);
  process.exit(1);
}

if (!existsSync(join(SITE, ".git"))) fail(`no kpow_v3 checkout at ${SITE} (set KPOW_SITE)`);

// the content has to be on GitHub first, or the rebuild clones the old version
const contentAhead = Number(git(ROOT, ["rev-list", "--count", "@{u}..HEAD"]) || 0);
if (contentAhead) fail(`kpow-buildlog has ${contentAhead} unpushed commit(s) — push those first`);

const branch = git(SITE, ["branch", "--show-current"]);
if (branch !== "main") fail(`kpow_v3 is on '${branch}', not main`);

const staged = git(SITE, ["diff", "--cached", "--name-only"]);
if (staged) fail(`kpow_v3 has staged changes; an empty commit would include them:\n${staged}`);

execFileSync("git", ["-C", SITE, "fetch", "-q", "origin", "main"], { stdio: "inherit" });
const [behind, ahead] = git(SITE, ["rev-list", "--left-right", "--count", "origin/main...HEAD"]).split(/\s+/).map(Number);
if (behind) fail(`kpow_v3 main is ${behind} commit(s) behind origin — pull first`);
if (ahead) fail(`kpow_v3 main has ${ahead} unpushed commit(s) of its own — push or sort those out first`);

const content = git(ROOT, ["rev-parse", "--short", "HEAD"]);
execFileSync("git", ["-C", SITE, "commit", "-q", "--allow-empty", "-m", `Redeploy: build log content ${content}`], { stdio: "inherit" });
execFileSync("git", ["-C", SITE, "push", "-q", "origin", "main"], { stdio: "inherit" });
console.log(`redeploy: pushed an empty commit to kpow_v3 main (content ${content}). DigitalOcean rebuilds in a few minutes.`);
