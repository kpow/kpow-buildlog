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
A desktop ADS-B scope on a round LCD. It paints live traffic around my home onto
a green sonar grid: a rotating sweep with a comet trail, heading triangles with
speed vectors out front, callsign and type and altitude tags, and anything out of
range parked as a bearing dot on the rim. Data comes from the public adsb.fi
opendata API over HTTPS, no local receiver, polled every 3 seconds for up to 64
aircraft.

The hardware is a GC9A01 1.28" round LCD (240×240, LovyanGFX) on an ESP32-C3
Super Mini, in a printed slatted case with a BOOT button and an optional touch
pad for range. An ESP32-S3 target exists too, for the better radio.

## How it's built

TLS eats RAM, so the whole thing is written around the heap:

- render into an 8-bit off-screen sprite, chosen specifically to survive the
  pressure of a live HTTPS poll
- stream-parse the JSON through a field filter, so the body is never held whole
- check the heap *before* opening the socket

Between polls each plane dead-reckons forward from its last heading and speed, so
motion stays smooth at 30 fps. That's capped: a dropped poll or an outage can't
fling a target off the edge.

There's a gzipped SPA baked into flash as well, served off the device itself:
radar, flight list, stats and detail cards off `/api/flights`, with the browser
enriching routes and photos from adsbdb and planespotters.
