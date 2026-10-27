---
date: 2026-10-26
title: "Party mode goes ferrofluid: tentacles, droplets and stacking spike patterns, v3.9.0"
tags: [party-mode, firmware, release]
media:
  - { src: media/party2-stack.jpg, kind: screenshot, caption: "A crown and a bloom stacked, on old-dino" }
  - { src: media/party2-crown.jpg, kind: screenshot, caption: "Rosensweig crown" }
  - { src: media/party2-bloom.jpg, kind: screenshot, caption: "Bloom: a mirrored pair of arms around a small spike" }
  - { src: media/party2-feeler.jpg, kind: screenshot }
  - { src: media/party2-stackchan-merge.jpg, kind: screenshot, caption: "Spike merge on skunky, down to the last three tall spikes" }
  - { src: media/party2-stackchan-stack.jpg, kind: screenshot, caption: "Stacked patterns on skunky, a Stackchan" }
---
Round two of party mode, the same day it shipped. I wanted the ferrofluid pushed much further: tentacles reaching into the show, droplets that fly off and flow back, a far jigglier body. A motion design agent and an art director agent wrote the specs, and a browser Tentacle Lab ran them at device pixels with the real eyes. I tuned it there: reach 1.2×, jiggle 1.7×, chunkier arms and bigger tip bulbs.

- **Frame rate:** the 1.69 was really running 13 fps. A fixed 33 ms delay sat on top of a 30 ms panel push at 40 MHz. Deadline pacing got it to 22 fps, and 80 MHz SPI writes to 30. Reading the panel's memory back matched all 67,200 pixels.
- **Tentacles:** 10-node spring chains with plump roots and round tip bulbs, rooted in a mound on the body. I'd take choppier motion for more of them, so groups of two or three reach out at once.
- **Patterns:** a library of magnet-style spike shapes, all mirrored about the line to the screen centre: Rosensweig crown, carousel, peak split, stadium wave, spike merge, bloom and a calm dome. A scheduler picks them, mostly medium-sized, because the small ones got lost on the screen.
- **Stacking:** I ran patterns on top of each other in the lab by accident and loved it. Each pattern now owns its own bank of spikes, so up to three play at once and their spikes add up.

> **Trap:** the first tentacles had a see-through gap where they met the body. The arm polygon wound the opposite way to the body, so the non-zero fill cancelled to zero where they overlapped. Every polygon now counts as wound the same way.

Out as v3.9.0, on old-dino and skunky.
