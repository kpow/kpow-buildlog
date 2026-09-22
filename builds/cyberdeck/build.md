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
A portable computer I built to be my bench, not just to sit on it.

The deck half is an assembly job, no code of mine in it:

- **Raspberry Pi 5**, 8 GB, with a 7" touchscreen
- **Mii Bluetooth keyboard** in a printed tray
- **M5Stack Stick / Joy-C** as the mouse

The repo name, `noodle-exp`, belongs to the other half. **noode-exp** is a
standalone ESP32-S3 gadget that lives on the deck as its electronics workbench: a
Lonely Binary ESP32-S3 N16R8 driving a 2" ST7789, an EC11 encoder and a KY-023
joystick, a 4×4 WS2812 matrix, a pair of LED filament "noodles" (hence the name),
and an HLK-LD2412 mmWave presence radar.

It runs 11 modes off about 2500 lines of monolithic C++, dual-core with a PSRAM
framebuffer:

| Kind | Modes |
|---|---|
| **3D** | Steer Cube, Cube Swarm, Warp Tunnel, Box Physics |
| **Pattern** | Chladni, Kaleido |
| **Light** | Filaments, LED Matrix, Color Pick |
| **Sensor** | Room Radar, Presence Log |

No WiFi, no Bluetooth, no companion app. It is a genuinely standalone appliance,
which is rarer than it should be.

The v1 case geometry came out broken. v2 got a redesigned keyboard tray, and that
one is the hero.
