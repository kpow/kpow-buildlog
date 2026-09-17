---
slug: noodle
title: NoodleLab v2
status: active
kind: hardware
summary: A modular LED light instrument that turned into a distributed system.
stack: [ESP32-S3, ESP32-C3, ESP-NOW, FastLED, FreeRTOS, PCA9685, PlatformIO]
tags: [led, esp-now, firmware, distributed]
rung: light → solder
repo: kpow/noodlez-v2
facts:
  satellites: 7
  effects: 16
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/noodlez-v2 }
started: 2026-03-23
---

A modular LED light instrument that turned into a distributed system. It started
as one microcontroller driving a few panels — but when it ran out of pins, I gave
every panel its own chip and linked them wirelessly. Now I can keep adding
surfaces without ever hitting a hardware wall, and they all animate together in
real time.

## How it works

An **ESP32-S3 core** (Adafruit FeatherS3) commands a fleet of **ESP-NOW
satellites** — 8×8, 16×16, and 12×8 matrices, an RGBW bar, a mic satellite, a
haptic dial remote, and a motorized disco ball — each its own ESP32-C3. The core
broadcasts one **58-byte packet**; every satellite receives the same packet and
renders locally, staying frame-synced without the core pushing every pixel.

- **Dual-core FreeRTOS** — radio on one core, FastLED render on the other, so they
  never step on each other (the S3's RMT peripheral fights the WiFi radio if you
  get the startup order wrong).
- **16 FastLED effects**, audio-reactive via a **512-point FFT** on the mic
  satellite that broadcasts bass/mid/treble/beat to the whole fleet.
- **Control surface:** three NeoPixel encoders, a NeoSlider, a ToF proximity
  sensor, capacitive touch, PCA9685-driven LED filaments + skull, and a
  lightning-bolt lane.

## Why it's built this way

The distributed architecture wasn't a flourish — it was running out of GPIO and
refusing to stop adding panels. Moving each surface to its own wireless board
means the system scales by adding *boards*, not pins.
