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
  consoles: 3
  games: 6
hero: media/megafun-hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/kfun }
started: 2026-05-28
---
A family of handheld consoles built from one monorepo.

| Spec | tinyfun | bigfun | megafun |
|---|---|---|---|
| Board | LOLIN S3 Mini Pro | ESP32-S3 SuperMini | ESP32-S3 SuperMini |
| Screen | 128×128 GC9107 | 2.0" 320×240 ST7789 | 2.0" 320×240 ST7789 |
| Input | 3 buttons | d-pad + two triggers | XY joystick + click |
| Layout | portrait | landscape | landscape |

tinyfun and bigfun run the same six slots, each game adapting to the hardware it
lands on: lean and legible on three buttons, grown into sprites and particle
juice on six. Sometimes the slot holds a different game entirely. Invaders
becomes Galaga on the wide board, Breakout becomes Arkanoid.

Tetris · Breakout · Snake · Invaders/Galaga · SkyGrid · Backgammon

megafun runs its own set on a joystick-native framework, and shares exactly the
piece that has to stay in lockstep: the backgammon rules engine and the ESP-NOW
link, so all three can play each other.

## How it holds together

`common/` never names a GPIO or a screen size. Pins live only in each board's
`Config.h`, and shared code branches on two capability flags those boards
declare, `KF_LANDSCAPE` and `KF_DPAD`. megafun is the reason there are two: it's
landscape but joystick, which one flag couldn't express. Adding a board means
declaring its capabilities, not adding a device identity.

The engine is a non-blocking contract (`init` / `update(dt)` / `render`) at a
fixed 60 Hz, with every game placement-new'd into a single 12 KB arena that fails
to compile if it won't fit. Two rules earned the hard way: the framebuffer is
pinned to SRAM because PSRAM faults on per-pixel writes, and the quit chord is
un-swallowable, so a misbehaving game can never trap you inside it.

Favourites among the six: **SkyGrid**, an original software 3D renderer with no
z-buffer that pushes 128 triangles at 60 fps, and **Backgammon**, fully
rules-checked and unit-tested, playing 2-ply expectimax on bigfun with a doubling
cube, Crawford rule and NVS match save.
