---
slug: vizkeys
title: vizKeys
status: active
kind: hybrid
summary: Per-key RGB for a ROCCAT Vulcan Pro TKL on macOS, running the Noodle 2K effects, with an ESP32-S3 desk controller.
stack: [macOS, Python, Swift, USB HID, ESP32-S3, TFT_eSPI, WS2812, DDP, PlatformIO]
tags: [led, keyboard, firmware]
repo: kpow/vizKeys
facts:
  effects: 25
  palettes: 23
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/vizKeys }
started: 2026-09-24
---

A Mac menu bar app that takes over the lighting on a ROCCAT Vulcan Pro TKL, one
key at a time, plus a small desk controller that picks and previews the effects.

## The keyboard side

vizKeys talks to the Vulcan over USB HID in its direct mode and redraws every key
on a fixed frame rate. It backs up the keyboard's own lighting first and puts it
back on every exit path, so quitting leaves the keyboard as it was.

The effects come in four groups:

- **Keys:** reactive, ripple and heatmap, driven by the keyboard's own keypress reports.
- **Audio:** spectrum and pulse, from whatever the Mac is playing, via a Core Audio process tap.
- **Ambient:** rainbow, noise and solid.
- **Noodle:** 17 effects and 23 palettes from Noodle 2K, the same C++ compiled unchanged into a Mac library and rendered on a 36×12 canvas that each key samples.

It runs as vizKeys.app: a skull in the menu bar, a web UI for settings, start at
login, and it reconnects on its own after unplug or sleep.

## The desk controller

A Waveshare ESP32-S3-Tiny with a 2.4" ST7789 screen, a rotary encoder and two
chained 8×8 WS2812 panels as a 16×8 preview. It finds vizKeys on Wi-Fi over
Bonjour, pairs with a 6-character code, and turns the knob into effect and setting
changes.

It doesn't receive pixels. vizKeys sends a small sync packet each frame (clock,
audio, keypresses) and the controller renders the same effects itself at 40 fps on
the screen and the panels. Firmware updates come over Wi-Fi, from the web UI.
