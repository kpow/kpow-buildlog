// sources.mjs — shared helpers for the maintenance scripts: read a build's
// entries and find the local checkout of its source repo.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const BUILDS = join(ROOT, "builds");
export const INBOX = join(ROOT, "inbox");
const PROJECTS = process.env.BUILDLOG_PROJECTS || join(homedir(), "projects");

// one entry per file: YYYY-MM-DD.md, or YYYY-MM-DD-<word>.md for a second one that day
export const ENTRY_FILE = /^(\d{4}-\d{2}-\d{2})(-[a-z0-9-]+)?\.md$/;

export function git(cwd, args) {
  try {
    return execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

export function field(text, key) {
  return text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1].trim().replace(/^["']|["']$/g, "");
}

export function slugs() {
  return readdirSync(BUILDS).filter((s) => existsSync(join(BUILDS, s, "build.md"))).sort();
}

/** build.md text plus its entries, oldest first: [{ file, date, title }] */
export function readBuild(slug) {
  const text = readFileSync(join(BUILDS, slug, "build.md"), "utf8");
  const logDir = join(BUILDS, slug, "log");
  const entries = existsSync(logDir)
    ? readdirSync(logDir)
        .filter((f) => ENTRY_FILE.test(f))
        .sort()
        .map((f) => {
          const body = readFileSync(join(logDir, f), "utf8");
          return { file: f, date: field(body, "date") || f.slice(0, 10), title: field(body, "title") || "" };
        })
    : [];
  return { text, entries, repo: field(text, "repo") || null, title: field(text, "title") || slug, status: field(text, "status") || "active" };
}

let cache = null;
/** owner/name (lowercased) -> local checkout path, found by origin remote. */
export function checkouts() {
  if (cache) return cache;
  cache = {};
  const visit = (dir, depth) => {
    let names;
    try { names = readdirSync(dir); } catch { return; }
    for (const name of names) {
      if (name.startsWith(".") || name === "node_modules") continue;
      const p = join(dir, name);
      try { if (!statSync(p).isDirectory()) continue; } catch { continue; }
      if (existsSync(join(p, ".git"))) {
        const url = git(p, ["remote", "get-url", "origin"]);
        const m = url.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/i);
        if (m) cache[m[1].toLowerCase()] ??= p;
      } else if (depth > 0) {
        visit(p, depth - 1);
      }
    }
  };
  visit(PROJECTS, 1);
  return cache;
}

export function sourceFor(repo) {
  return repo ? checkouts()[repo.toLowerCase()] || null : null;
}

/** commits in (after, until] — dates are YYYY-MM-DD, either may be null. */
export function commitsBetween(source, after, until) {
  const args = ["log", "--all", "--no-merges", "--date=short", "--format=%cd %h %s"];
  if (after) args.push("--after", `${after} 23:59:59`);
  if (until) args.push("--before", `${until} 23:59:59`);
  const out = git(source, args);
  return out ? out.split("\n").reverse() : [];
}
