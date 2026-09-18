#!/usr/bin/env node
// photo.mjs — get a phone photo ready to commit. macOS only (uses the built-in
// `sips`); no npm dependencies, same as the generator.
//
//   node scripts/photo.mjs info <file...>        # when each was taken, size, GPS?
//   node scripts/photo.mjs ingest <in> <out.jpg> # resize + orient + strip metadata
//
// ingest:
//   - converts anything sips reads (HEIC, PNG, JPEG) to JPEG, longest edge <= 1600px
//   - bakes the EXIF orientation into the pixels, so the photo stays upright
//     once the orientation tag is gone
//   - strips EXIF / XMP / IPTC / comments and any appended images. Phone photos
//     carry GPS; committing one would publish where it was taken. Only the ICC
//     colour profile is kept, so Display-P3 colours still look right.
//   - re-reads the result and refuses to finish if any EXIF survived.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MAX_EDGE = 1600;
const QUALITY = 82;

function sips(args) {
  return execFileSync("sips", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function dims(file) {
  const out = sips(["-g", "pixelWidth", "-g", "pixelHeight", file]);
  return {
    width: Number(out.match(/pixelWidth:\s*(\d+)/)?.[1] || 0),
    height: Number(out.match(/pixelHeight:\s*(\d+)/)?.[1] || 0),
  };
}

// ---- JPEG segment walking ---------------------------------------------------

function* segments(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error("not a JPEG");
  let i = 2;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) throw new Error(`bad JPEG marker at byte ${i}`);
    const marker = buf[i + 1];
    if (marker === 0xda) { yield { marker, start: i, end: buf.length, sos: true }; return; }
    const len = buf.readUInt16BE(i + 2);
    yield { marker, start: i, end: i + 2 + len, data: buf.subarray(i + 4, i + 2 + len) };
    i += 2 + len;
  }
}

function isExif(seg) {
  return seg.marker === 0xe1 && seg.data.subarray(0, 6).toString("latin1") === "Exif\0\0";
}

/** orientation, when it was taken, and whether a GPS block is present. */
function readExif(buf) {
  const info = { orientation: 1, taken: null, gps: false, exif: false };
  for (const seg of segments(buf)) {
    if (seg.sos) break;
    if (!isExif(seg)) continue;
    info.exif = true;
    const t = seg.data.subarray(6);
    const le = t.toString("latin1", 0, 2) === "II";
    const u16 = (o) => (le ? t.readUInt16LE(o) : t.readUInt16BE(o));
    const u32 = (o) => (le ? t.readUInt32LE(o) : t.readUInt32BE(o));
    const ifd = (off, visit) => {
      if (!off || off + 2 > t.length) return;
      const n = u16(off);
      for (let k = 0; k < n; k++) {
        const e = off + 2 + k * 12;
        if (e + 12 > t.length) return;
        visit(u16(e), e);
      }
    };
    ifd(u32(4), (tag, e) => {
      if (tag === 0x0112) info.orientation = u16(e + 8);
      if (tag === 0x8825) info.gps = true;
      if (tag === 0x8769) {
        ifd(u32(e + 8), (sub, se) => {
          if (sub === 0x9003) {
            const s = t.toString("latin1", u32(se + 8), u32(se + 8) + 19); // "YYYY:MM:DD HH:MM:SS"
            const m = s.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}:\d{2})/);
            if (m) info.taken = `${m[1]}-${m[2]}-${m[3]} ${m[4]}`;
          }
        });
      }
    });
  }
  return info;
}

/** Keep only what's needed to display the image. The first EOI after the scan
 *  ends the main picture — anything past it (iPhone gain maps, MPF extras) goes. */
function strip(buf) {
  const keep = [buf.subarray(0, 2)];
  for (const seg of segments(buf)) {
    if (seg.sos) {
      const eoi = buf.indexOf(Buffer.from([0xff, 0xd9]), seg.start + 2);
      keep.push(buf.subarray(seg.start, eoi < 0 ? buf.length : eoi + 2));
      break;
    }
    const m = seg.marker;
    const app2 = m === 0xe2 ? seg.data.subarray(0, 12).toString("latin1") : "";
    const drop =
      m === 0xe1 ||                                   // EXIF + XMP
      m === 0xed ||                                   // IPTC / Photoshop
      m === 0xfe ||                                   // comment
      (m === 0xe2 && !app2.startsWith("ICC_PROFILE")) || // MPF index, not the colour profile
      (m >= 0xe3 && m <= 0xef && m !== 0xee);         // vendor APPn (keep Adobe APP14)
    if (!drop) keep.push(buf.subarray(seg.start, seg.end));
  }
  return Buffer.concat(keep);
}

// sips -r rotates clockwise. Mirrored orientations (2,4,5,7) don't come off phones.
const ROTATE = { 3: 180, 6: 90, 8: 270 };

function takenFallback(file) {
  try {
    const out = execFileSync("mdls", ["-raw", "-name", "kMDItemContentCreationDate", file], { encoding: "utf8" });
    const d = new Date(out.trim().replace(" +0000", "Z").replace(" ", "T"));
    if (isNaN(d)) return null;
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  } catch {
    return null;
  }
}

function toJpeg(input, dir) {
  const tmp = join(dir, "converted.jpg");
  sips(["-s", "format", "jpeg", "-s", "formatOptions", String(QUALITY), input, "--out", tmp]);
  return tmp;
}

function info(file) {
  const dir = mkdtempSync(join(tmpdir(), "photo-"));
  try {
    const jpg = toJpeg(file, dir);
    const exif = readExif(readFileSync(jpg));
    const { width, height } = dims(file);
    return { file, taken: exif.taken || takenFallback(file), width, height, orientation: exif.orientation, gps: exif.gps };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function ingest(input, output) {
  const dir = mkdtempSync(join(tmpdir(), "photo-"));
  try {
    const jpg = toJpeg(input, dir);
    const before = readExif(readFileSync(jpg));

    const deg = ROTATE[before.orientation];
    if (deg) sips(["-r", String(deg), jpg]);

    const { width, height } = dims(jpg);
    if (Math.max(width, height) > MAX_EDGE) sips(["-Z", String(MAX_EDGE), jpg]);

    const clean = strip(readFileSync(jpg));
    const after = readExif(clean);
    if (after.exif || after.gps) throw new Error(`metadata survived stripping: ${input}`);

    writeFileSync(output, clean);
    const out = dims(output);
    return {
      in: input,
      out: output,
      taken: before.taken || takenFallback(input),
      width: out.width,
      height: out.height,
      rotated: deg || 0,
      hadGps: before.gps,
      kb: Math.round(clean.length / 1024),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === "info" && args.length) {
    for (const f of args) console.log(JSON.stringify(info(f)));
  } else if (cmd === "ingest" && args.length === 2) {
    console.log(JSON.stringify(ingest(args[0], args[1])));
  } else {
    console.error("usage: photo.mjs info <file...> | photo.mjs ingest <in> <out.jpg>");
    process.exit(2);
  }
} catch (err) {
  console.error(`photo.mjs: ${err.message}`);
  process.exit(1);
}
