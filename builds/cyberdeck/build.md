---
slug: cyberdeck
title: The Cyberdeck (noode-exp)
status: active
kind: hardware
summary: A portable Raspberry Pi workstation with a custom ESP32 electronics bench.
stack: [Raspberry Pi 5, ESP32-S3, ST7789, WS2812, HLK-LD2412, PlatformIO]
tags: [cyberdeck, pi, bench]
rung: design
repo: kpow/noodle-exp
facts:
  modes: 11
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/noodle-exp }
started: 2026-06-28
---

The Cyberdeck is a portable computer I built to be my bench, not just sit on it. At
its core is an 8 GB **Raspberry Pi 5** with a **7" touchscreen**, a **Mii Bluetooth
keyboard**, and an **M5Stack Stick / Joy-C** standing in as the mouse — all folded
into a custom-designed case with a matching box for the electronics side. There's no
Pi code here; the deck is a computer I assembled, and the repo name (`noodle-exp`)
belongs to the *other* half of the rig.

That other half is **noode-exp**, a standalone ESP32-S3 gadget that lives on the deck
as its electronics workbench. It's a Lonely Binary **ESP32-S3 N16R8** driving a 2"
**ST7789**, an EC11 encoder + KY-023 joystick, a **4×4 WS2812 matrix**, a pair of LED
filament "noodles" (the name), and an **HLK-LD2412 mmWave presence radar** — all under
~2500 lines of monolithic C++ with **11 modes** (Steer Cube, Cube Swarm, Warp Tunnel,
Box Physics, Chladni, Kaleido, Filaments, LED Matrix, Color Pick, Room Radar, Presence
Log). It's dual-core with a PSRAM framebuffer and no connectivity at all — a genuinely
standalone appliance. The v1 case geometry came out broken, so v2 got a redesigned
keyboard tray, which is the build hero.

*(A fuller, git-derived history is pending — this devlog is reconstructed from the
photos and technical notes because the repo export 404'd on a name typo.)*
