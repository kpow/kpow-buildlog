---
slug: vizmac
title: vizMac
status: active
kind: hybrid
summary: Per-key RGB for a ROCCAT Vulcan Pro TKL on macOS, plus an ESP32-S3 desk controller with Now Playing, a focus clock and WLED control.
stack: [macOS, Python, Swift, USB HID, ESP32-S3, TFT_eSPI, WS2812, WLED, PlatformIO]
tags: [led, keyboard, firmware]
repo: kpow/vizMac
facts:
  effects: 25
  palettes: 23
  modes: 4
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/vizMac }
started: 2026-09-24
---

A Mac menu bar app that takes over the lighting on a ROCCAT Vulcan Pro TKL, one
key at a time, plus a desk controller next to the keyboard. It started as vizKeys
and was renamed vizMac once the controller grew past the keyboard.

## The keyboard side

vizMac talks to the Vulcan over USB HID in its direct mode and redraws every key
on a fixed frame rate. It backs up the keyboard's own lighting first and puts it
back on every exit path, so quitting leaves the keyboard as it was.

The effects come in four groups:

- **Keys:** reactive, ripple and heatmap, driven by the keyboard's own keypress reports.
- **Audio:** spectrum and pulse, from whatever the Mac is playing, via a Core Audio process tap.
- **Ambient:** rainbow, noise and solid.
- **Noodle:** 17 effects and 23 palettes from Noodle 2K, the same C++ compiled unchanged into a Mac library and rendered on a 36×12 canvas that each key samples.

It runs as vizMac.app: a skull in the menu bar, a web UI for settings, start at
login, and it reconnects on its own after unplug or sleep.

## The desk controller

A Waveshare ESP32-S3-Tiny with a 2.4" ST7789 screen, a rotary encoder with push, a
KO button and two chained 8×8 WS2812 panels as a 16×8 display. It finds vizMac on
Wi-Fi over Bonjour and pairs with a 6-character code.

It has four modes behind a mode picker:

- **Keys:** pick and tune the keyboard effects. The 16×8 shows the keyboard.
- **Now Playing:** Spotify or Music with album art. Turn to skip. The 16×8 is a palette EQ.
- **Clock:** an analog face and a focus timer that flashes the keyboard when it ends.
- **WLED:** the lights on the network, picked and ordered in the web UI, controlled directly.

It doesn't receive pixels. vizMac sends a small sync packet each frame (clock,
audio, keypresses) and the controller renders the effects itself at 40 fps.

Wi-Fi is set up from a phone by QR code. Firmware updates come over Wi-Fi from the
web UI. The controller sleeps and wakes with the Mac.
