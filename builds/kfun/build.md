---
slug: kfun
title: kFun
status: active
kind: hardware
summary: Two handheld game consoles built from one codebase.
stack: [ESP32-S3, C++, LovyanGFX, PlatformIO]
tags: [handheld, games, firmware]
rung: design
repo: kpow/kfun
facts:
  consoles: 2
  games: 6
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/kfun }
started: 2026-07-28
---

Two handheld consoles, one codebase. **tinyfun** is a LOLIN S3 Mini Pro with a
128×128 screen and three buttons; **bigfun** is an ESP32-S3 SuperMini with a
320×240 screen and six. A single `KFUN_WIDE` compile-time split is all that
separates them — pins live only in each board's `Config.h`, and nothing in the
engine, UI, or games ever names a GPIO. Some slots are literally a different
game per console: Invaders becomes Galaga on the wide board, Breakout becomes
Arkanoid.

The engine is a non-blocking Game contract (`init` / `update(dt)` / `render`)
running at a fixed 60 Hz, with every game placement-new'd into a single 12 KB
arena that fails to compile if it won't fit. The framebuffer is pinned to SRAM
because PSRAM faults on per-pixel writes, and the quit chord is un-swallowable so
a misbehaving game can never trap you. Highlights among the six slots: **SkyGrid**,
an original software 3D renderer with no z-buffer that pushes 128 triangles at
60 fps, and **Backgammon**, a fully rules-checked, natively unit-tested engine
that plays 2-ply expectimax on bigfun with doubling cube, Crawford, and NVS match
save.
