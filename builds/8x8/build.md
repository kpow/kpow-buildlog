---
slug: 8x8
title: 8x8 labz
status: active
kind: hardware
summary: A pocket sketchbook for 8x8 pixel icons, synced to one shared catalog.
stack: [ESP32, LVGL, FastLED, PlatformIO, React, Postgres]
tags: [led, firmware, icons]
repo: kpow/8x8
facts:
  matrix: 8x8
  patterns: 16
  transitions: 9
  seedIcons: 30
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/8x8 }
started: 2026-09-14
---

It started with watching artists at live sketch events, each with a pocket
sketchbook, catching an idea the moment it showed up. I wanted the same thing in
my own medium: a page that is an 8×8 grid and ink that is light. There was a
practical reason too — old-school 8×8 icons had been hand-typed into C arrays in
noodlez-v2 and vizpow, every copy quietly drifting from the others.

So: one catalog, three ways in. A web app holds every icon and is the source of
truth. A handheld syncs it, browses it, draws new ones by touch, and plays them
on a real 8×8 WS2812B matrix. Any other firmware pulls the whole catalog as a
single `icons.h`.

## The handheld

An ESP32-2432S028 — the "Cheap Yellow Display" — with a 2.8" 320×240 ILI9341
panel and a resistive XPT2046 touchscreen, running LVGL 9 on PlatformIO. The
matrix hangs off a bare GPIO with no level shifter, 5V from VIN. Two build
targets: `cyd` puts LED data on GPIO 27, and `cyd-tx` puts it on the TX pin for a
one-cable build, with serial logging switched off so the log does not reach the
LEDs.

Sixty-four WS2812Bs at full white would pull about 3.8 A, so brightness is capped
at 40/255 and FastLED is held to 450 mA. How the matrix sits in the case is a
per-device setting rather than a constant — one lookup folds rotation, flips and
serpentine wiring together.

## The format

A frame is 64 palette indices, 128 hex characters, row-major from the top left.
The palette is global, append-only and caps at 256 colors; index 0 is black and
doubles as off. Icon numbers are permanent and icons are archived rather than
deleted, so nothing downstream ever breaks. Colors carry a family, usually six
shades generated from one base color in OKLCH so the steps look even.

## Living in 320 KB

| Budget | What's in it |
|---|---|
| 320 KB RAM | no PSRAM at all |
| 4 MB flash | 2.5 MB app slot, 1.4 MB LittleFS |
| ~50 KB free | what a TLS handshake wants |

That last line is the one that shapes the firmware. Every screen except Home is
built on entry and freed on exit, and that is what stopped sync rebooting the
board mid-handshake. Icons, palette and pending edits live in the flash cache, so
the whole thing works with the WiFi off. Sync runs on its own task on core 0 and
pulls only what changed since its cursor, twelve icons a page.

Edits made on the device queue in an outbox and upload before the next pull. Each
draft carries a hash of the server it was drawn against, so an edit can never be
uploaded somewhere it does not belong. If someone changed the icon first the
server answers 409, and the device keeps its version as a copy instead of
throwing the drawing away.
