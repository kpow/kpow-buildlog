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
cover is the real one, fetched and decoded on the board at full bleed, artist
along the top edge, title and progress along the bottom in a 3×5 pixel face. No
app, no cloud service, nothing left running on a computer.

## What it does

- **Now Playing:** the cover at 64×64, crossfading on every track change
- **Visualizer:** 22 effects out of the NoodleLab catalog, driven by a 512-point FFT of the board's own mics. 16 log-spaced bands, spectral-flux beat detection, 23 palettes, a new one on every effect change
- **Ambient:** slow patterns when nothing is playing, reacting to room audio so it still moves when the music is coming from somewhere else. A cover you played earlier fades in with how long ago it was
- **Kaleidoscope:** mirror and rotational folds over any effect, with live blend, spin and slice
- **Control page:** all of it from a phone on the same WiFi, plus Spotify search and transport. The browser talks to Spotify directly, so the board pays nothing for it

Giving one away needs no computer. The panel shows a QR code and the new owner
connects their own Spotify from their phone. The sign-in travels encrypted, so
the relay never sees it.

## How it's built

Arduino on ESP-IDF, five FreeRTOS tasks, one owner per peripheral: render, audio
and the thumb wheel on core 1, WiFi and Spotify and the web server on core 0.
Internal RAM is the whole design constraint.

| Internal, 320 KB | PSRAM, 8 MB |
|---|---|
| panel DMA buffers | the 64×64 canvases |
| WiFi stack | album art and JPEG buffers |
| one TLS session | track history, API bodies |

There is room for exactly one TLS context, so the Spotify API, the token
endpoint and the art CDN take turns, and whoever wants it drops the other's
keep-alive first. Two separate bugs came out of forgetting that.

The effect catalog is a dated snapshot of the shared library from NoodleLab,
with the ESP-NOW wire format cut out.
