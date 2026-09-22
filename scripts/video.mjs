#!/usr/bin/env node
// video.mjs — get a phone clip ready to commit. Uses ffmpeg/ffprobe (not sips),
// so it works on macOS, Linux and Windows; no npm dependencies.
//
//   node scripts/video.mjs info <file...>             # when each was shot, size, length, GPS?
//   node scripts/video.mjs ingest <in> <out.mp4>      # transcode + strip metadata + poster
//
// ingest:
//   - reads anything ffmpeg reads (.MOV, .mp4, .m4v …) and writes H.264 .mp4,
//     at most 1280px wide, no audio, faststart so it streams on the site
//   - bakes the phone's rotation into the pixels (ffmpeg autorotate)
//   - drops ALL source metadata (-map_metadata -1): iPhone clips carry GPS
//     (com.apple.quicktime.location.ISO6709 / ©xyz) and the creation date.
//     Only ffmpeg boilerplate survives (major_brand, encoder, handler_name).
//   - writes a poster <out>.jpg from ~40% in, same width, also metadata-free —
//     unless that .jpg already exists (e.g. a still ingested by photo.mjs), which is kept
//   - re-reads both results and refuses to finish if a location or date survived.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";

const MAX_WIDTH = 1280;
const SCALE = `scale='min(${MAX_WIDTH},iw)':-2:flags=lanczos`;

// Tags a clean ffmpeg mp4 is allowed to carry. Anything else is treated as leaked.
const ALLOWED_TAGS = new Set(["major_brand", "minor_version", "compatible_brands", "encoder", "handler_name", "vendor_id", "language"]);
const LEAK_TAG = /location|iso6709|gps|creation_time|date|com\.apple|make|model|software/i;
// Raw atoms that hold a location, in case a tag hides from ffprobe.
const LEAK_BYTES = [Buffer.from([0xa9, 0x78, 0x79, 0x7a]) /* ©xyz */, Buffer.from("com.apple.quicktime")];

function run(cmd, args) {
  return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
}

function probe(file) {
  return JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]));
}

function tagsOf(p) {
  const all = { ...(p.format?.tags || {}) };
  for (const s of p.streams || []) for (const [k, v] of Object.entries(s.tags || {})) all[`${s.codec_type}:${k}`] = v;
  return all;
}

function summary(file) {
  const p = probe(file);
  const v = (p.streams || []).find((s) => s.codec_type === "video") || {};
  const tags = tagsOf(p);
  const find = (re) => Object.entries(tags).find(([k]) => re.test(k))?.[1] || null;
  const shot = find(/com\.apple\.quicktime\.creationdate/i) || find(/creation_time/i);
  return {
    file,
    shot: shot ? shot.replace("T", " ").slice(0, 16) : null,
    width: v.width || 0,
    height: v.height || 0,
    seconds: Math.round(Number(p.format?.duration || 0) * 10) / 10,
    gps: Boolean(find(/location|iso6709|gps/i)),
  };
}

/** Throw if the output still carries anything beyond ffmpeg boilerplate. */
function assertClean(file) {
  const leaked = Object.entries(tagsOf(probe(file)))
    .map(([k]) => k.replace(/^\w+:/, ""))
    .filter((k) => !ALLOWED_TAGS.has(k) || LEAK_TAG.test(k));
  if (leaked.length) throw new Error(`metadata survived in ${file}: ${[...new Set(leaked)].join(", ")}`);
  const bytes = readFileSync(file);
  for (const needle of LEAK_BYTES) if (bytes.includes(needle)) throw new Error(`location atom survived in ${file}`);
}

function ingest(input, output) {
  if (!/\.mp4$/i.test(output)) throw new Error("output must end in .mp4");
  const poster = output.replace(/\.mp4$/i, ".jpg");
  const keepPoster = existsSync(poster);
  const before = summary(input);

  run("ffmpeg", [
    "-v", "error", "-i", input,
    "-vf", SCALE,
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "27", "-preset", "veryfast",
    "-movflags", "+faststart", "-an", "-map_metadata", "-1", "-y", output,
  ]);
  if (!keepPoster) run("ffmpeg", [
    "-v", "error", "-ss", String(before.seconds * 0.4), "-i", input,
    "-frames:v", "1", "-vf", SCALE, "-q:v", "3", "-map_metadata", "-1", "-y", poster,
  ]);

  try {
    assertClean(output);
    if (!keepPoster) assertClean(poster);
  } catch (err) {
    rmSync(output, { force: true });
    if (!keepPoster) rmSync(poster, { force: true });
    throw err;
  }

  const after = summary(output);
  return {
    in: input,
    out: output,
    poster: keepPoster ? `${poster} (existing, kept)` : poster,
    shot: before.shot,
    width: after.width,
    height: after.height,
    seconds: after.seconds,
    hadGps: before.gps,
    kb: Math.round(statSync(output).size / 1024),
  };
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === "info" && args.length) {
    for (const f of args) console.log(JSON.stringify(summary(f)));
  } else if (cmd === "ingest" && args.length === 2) {
    console.log(JSON.stringify(ingest(args[0], args[1])));
  } else {
    console.error("usage: video.mjs info <file...> | video.mjs ingest <in> <out.mp4>");
    process.exit(2);
  }
} catch (err) {
  console.error(`video.mjs: ${err.message.split("\n")[0]}`);
  process.exit(1);
}
