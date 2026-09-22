---
slug: vizbot
title: vizBot
status: shipped
kind: hardware
summary: A companion robot with a face, personalities, and a cloud backend.
stack: [ESP32-S3, FreeRTOS, arduinoFFT, ESP-NOW, Node.js, DigitalOcean]
tags: [robot, cloud, iot, firmware]
rung: solder → design
repo: kpow/vizpow
facts:
  expressions: 25
  deployed: 4
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/vizpow }
started: 2026-01-24
---
vizBot is a little companion robot with a face. 25 procedurally-drawn
expressions and a handful of personalities that decide how it reacts to the
room. It started as an LED matrix controller and grew a face, then a voice, then
opinions.

Everything on screen is drawn from primitives, eyes and mouths and tweened
transitions, so the same face engine renders on a Waveshare LCD, an M5 Core S3
and a 1-bit 128×64 OLED without a per-device redraw. It listens on a 512-point
FFT of the Core S3 mic, drives a StackChan servo base for head movement, and
pushes its speech to a WLED matrix over DDP, drawing the pixels itself rather
than fighting WLED's scroll effects for them.

## The fleet part

Dual-core FreeRTOS underneath: rendering on one core, WiFi and HTTP and mesh and
an isolated cloud task on the other. Two networks, doing different jobs:

- **vizCloud**, a Node.js backend I run on DigitalOcean, handles registration,
  telemetry, fleet groups and server-queued commands, including NTP-scheduled
  ones so a room of bots can move together.
- **An ESP-NOW mesh** handles the local etiquette. Flag bits in a broadcast
  packet mean two bots won't drive the same WLED matrix, and one will defer its
  speech bubble until a peer releases the display.

Four of them are living in other places now, which makes it a real fleet in the
wild rather than a demo with plans.
