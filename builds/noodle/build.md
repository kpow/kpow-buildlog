---
slug: noodle
title: Noodle 2K
status: active
kind: hardware
summary: A one-tray LED instrument: an ESP32-S3 console driving a wireless fleet of panels, a disco ball and a dial remote.
stack: [ESP32-S3, ESP32-C3, ESP-NOW, FastLED, FreeRTOS, MatrixPortal S3, Protomatter, PlatformIO]
tags: [led, esp-now, firmware, distributed]
rung: light → solder
repo: kpow/noodlez-v2
facts:
  satellites: 6
  effects: 22
  palettes: 23
hero: media/noodle-2k-lit.jpg
links:
  - { label: repo, url: https://github.com/kpow/noodlez-v2 }
started: 2026-03-23
---

A modular LED light instrument that turned into a distributed system, then got
pulled back together onto one tray. It's had three names along the way.

## Noodle → NoodleLab → Noodle 2K

**Noodle** (March 2026) was a breadboard: one controller, a few LED grids and
filaments, and a rat's nest of jumpers. It worked, barely, and every new surface
meant more wires.

**NoodleLab** (April–July) rebuilt it on an Adafruit FeatherS3 with STEMMA-QT
parts. When an external 8×8 hit the GPIO wall, every LED surface became its own
ESP32-C3 satellite over ESP-NOW: an audio sat, a 1×30 bar, 8×8, 16×16 and 12×8
matrices, a motorized disco ball and a haptic dial remote. It scaled by adding
boards, not pins.

**Noodle 2K** (from August 29) came out of a strip-to-bare-MCU rebuild. The
filaments and the PCA9685 went for good, the 16×16 moved onto a console pin, the
icon and 12×8 sats were retired, and everything moved onto one tray behind silver
diffusers. It's LEDs only now.

## What's running now

The **console** is still the FeatherS3, now with a 2.4" ST7789 mounted landscape
for a 320×240 UI and a Chladni resonant-plate visualizer as the screensaver. It
drives a 12×4 matrix, a 4×8 FeatherWing and the 16×16 directly. It never joins
WiFi: it scans channels 1, 6 and 11 at boot and runs ESP-NOW on the quietest.

Over ESP-NOW:

- a **1×30 RGBW bar** arc
- an **audio sat** with an INMP441 mic, broadcasting bass, mid, treble and beat so
  the whole fleet reacts together
- the **disco ball**: stepper, spot LED and OLED, on its own supply
- the **dial**, a round 1.8" knob with touch and haptics that mirrors the
  console's state
- two **HUB75 panels** on MatrixPortal S3 boards, a 64×32 and a 128×64, fed the
  same packets side by side until one is retired

**22 effects**, including a trimmed port of WLED's 2D particle system and a
16-band GEQ, all render through **23 palettes**. The hub75 panels also run the
**Patternflow bank**: JavaScript patterns hand-ported to C++, plus my own Mondrian.

**Controls:** three NeoPixel encoders, a NeoSlider, capacitive touch pads that pick
the target (matrix, disco or Patternflow), a nav encoder, and two Qwiic buttons.
Green steps patterns; red rolls a random palette.

## Why it's built this way

The distributed architecture wasn't a flourish — it was running out of GPIO and
refusing to stop adding panels. Moving each surface to its own wireless board
means the system scales by adding *boards*, not pins.
