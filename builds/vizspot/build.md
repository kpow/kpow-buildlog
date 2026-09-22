---
slug: vizspot
title: vizSpot
status: shipped
kind: hardware
summary: A 64×64 LED matrix that shows what Spotify is playing, and dances to it.
stack: [ESP32-S3, HUB75, HUB75-DMA, JPEGDEC, arduinoFFT, ESPAsyncWebServer, PlatformIO]
tags: [led, spotify, firmware]
repo: kpow/vizSpot
facts:
  effects: 22
  palettes: 23
  panel: 64x64
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/vizSpot }
  - { label: guide, url: https://kpow.xyz/vizspot/guide }
  - { label: control page guide, url: https://kpow.xyz/vizspot/controls }
started: 2026-09-07
---

A 64×64 LED matrix that shows what Spotify is playing, and dances to it. The
album art is the real cover, fetched and decoded on the device at full bleed,
with the artist along the top edge and the title and a progress bar along the
bottom in a 3×5 pixel face. No app, no cloud service, nothing left running on a
computer.

## What it does

- **Now Playing** — the cover at 64×64, crossfading on every track change.
- **Visualizer** — 22 effects from the noodlez-v2 catalog, driven by a
  512-point FFT of the board's own microphones: 16 log-spaced bands and
  spectral-flux beat detection, through 23 palettes, a new one on every effect
  change. A kaleidoscope post-filter folds any of them.
- **Ambient** — slow patterns when nothing is playing, reacting to room audio so
  it still moves when the music comes from somewhere else. A cover you played
  earlier fades in with how long ago it was.
- **Control page** — everything above from a phone on the same WiFi, plus
  Spotify search and transport. The browser talks to Spotify directly, so the
  board pays nothing for it.

Giving one away needs no computer: the panel shows a QR code, and the new owner
connects their own Spotify from their phone. The sign-in travels encrypted, so
the relay can't read it.

## How it's built

Arduino on ESP-IDF with five FreeRTOS tasks, one owner per peripheral: render
and audio and the thumb wheel on core 1, WiFi and Spotify and the web server on
core 0. Internal RAM is the scarce resource — the panel's DMA buffers, the WiFi
stack and one TLS session share 320 KB — so canvases, album art, history and
JPEG buffers all live in PSRAM, and there is exactly one TLS context, borrowed
in turn by the Spotify API, the token endpoint and the art CDN.

The effect catalog is a dated snapshot of the shared library from NoodleLab,
with the ESP-NOW wire format cut out.
