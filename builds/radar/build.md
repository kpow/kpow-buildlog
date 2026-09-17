---
slug: radar
title: ESP32 Plane Radar
status: shipped
kind: hardware
summary: A desktop ADS-B aircraft scope on a round LCD.
stack: [ESP32-C3, LovyanGFX, ADS-B, PlatformIO]
tags: [display, adsb, firmware]
rung: solder
repo: kpow/ESP32-Plane-Radar
facts:
  aircraft: 64
  screen: 1.28in round
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/ESP32-Plane-Radar }
started: 2026-06-13
---

A desktop ADS-B aircraft **radar scope**. It paints the live traffic around my
home lat/lon onto a green sonar grid — a rotating sweep with a comet trail,
heading triangles with speed vectors out front, callsign/type/altitude tags, and
anything out of range parked as a bearing-dot on the rim. The data comes from the
public **adsb.fi opendata REST API** over HTTPS (no local receiver), polled every
3 seconds for up to **64 aircraft**, with the radius scaled to the screen edge.
It all lives on a **GC9A01 1.28" round LCD** (240×240, LovyanGFX) driven by an
**ESP32-C3 Super Mini**, in a printed slatted case with a BOOT button and an
optional touch pad to cycle range.

## How it's built

The whole thing is **heap-aware everywhere**, because TLS eats RAM. I render into
an **8-bit off-screen sprite framebuffer** (chosen specifically to survive the
heap pressure of a live HTTPS poll), stream-parse the JSON with a field filter so
I never hold the whole body, and check the heap *before* opening the socket. Between
polls the scope **dead-reckons each plane forward** from its last heading and speed
so motion stays smooth at 30 fps — capped, so a dropped poll or an outage can't
fling a target off the edge. There's also a full **gzipped SPA companion app baked
into flash** — radar, flight list, stats, and detail cards served off `/api/flights`,
with the browser enriching routes and photos from adsbdb and planespotters. An
**ESP32-S3 target** exists too, for the better radio.
