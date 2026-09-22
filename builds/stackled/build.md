---
slug: stackled
title: StackLED
status: shipped
kind: hardware
summary: A handheld LED stacker arcade game.
stack: [ESP32-C3, MAX7219, PlatformIO]
tags: [game, led, firmware]
rung: solder
repo: kpow/stackled
facts:
  matrix: 8x32
  builtAt: makedown
hero: media/hero.jpg
links:
  - { label: repo, url: https://github.com/kpow/stackled }
started: 2026-07-04
---
It's the carnival Stacker, the skill-tester where you pile a sliding light bar up
a tower. A lit bar slides left and right across a tall 8×32 field, you mash the
button to drop it, and only the pixels that overlap the row below survive.
Overhang gets trimmed, so the bar gets narrower every time you're sloppy. Reach
the top to clear the level. Five hand-authored levels, each faster and thinner
than the last, then it goes procedurally endless.

An ESP32-C3 Super Mini drives four MAX7219 panels, with an illuminated button and
a speaker that can scream.

## The bar is the health meter

The twist I'm proudest of. There's no separate lives counter: the same bar you're
stacking erodes on wall-bounces and misses, and when its width hits zero you're
done.

Under it all is bitmask math, no pixel arrays at all. Each row is a `uint8_t`:

- a new row AND'd with the one below leaves the survivors
- popcount gives the width
- count-trailing-zeros gives the left edge

I built it at makedown, a crew maker-weekend where everyone hauls in their own
project. I brought a bag of panels and a green 3D-printed wand, and left with a
game.
