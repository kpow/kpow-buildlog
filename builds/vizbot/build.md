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

vizBot is a little companion robot with a face — 25 procedurally-drawn
expressions and a handful of personalities that decide how it reacts to the
room. It started as an LED matrix controller and grew a face, then a voice, then
opinions. Everything on the screen is drawn from primitives (eyes, mouths, tweened
transitions), so the same face engine renders identically across a Waveshare LCD,
an M5 Core S3, and a 1-bit 128×64 OLED. It listens with a 512-point FFT on the
Core S3 mic and reacts to sound, gets audio-reactive ambient effects, drives a
**StackChan** servo base for physical head movement, and pushes its speech out to
a **WLED matrix over DDP** — direct pixel control, no scroll-effect games.

Under the hood it's dual-core FreeRTOS: rendering on one core, WiFi/HTTP/mesh and
an isolated cloud task on the other. The bots talk to **vizCloud** — a separate
Node.js backend I run on DigitalOcean — to register, sync telemetry, join fleet
groups, and pull server-queued commands, including NTP-scheduled commands so a
whole room of bots can move together. On the local side they form an **ESP-NOW
mesh** that does cooperative WLED arbitration: two bots won't stomp the same
matrix, and one will even defer its speech bubble until a peer releases the
display. Four of them are living in other places now — a real fleet in the wild.
