---
date: 2026-11-15
title: "Escape Velocity: space pinball in three rooms"
tags: [escape-velocity, game, pinball]
media:
  - { src: media/ev-title.jpg, kind: render }
  - { src: media/ev-multiball.jpg, kind: render }
---
Escape Velocity is a space pinball table in the Telemetry style: mission-control
phosphor on true black. The table is three rooms stacked into one 480 x 1440
world: the Launch Pad, the Orbit and the Moon. A camera scrolls between them as
the ball goes up the ramps and comes back down the wires.

The first build had the Pad and the Orbit. On the device it ran at a median 31.9
fps while scrolling, and the camera brought the flippers on screen 1.2 s before
the ball came back. Scrolling was easy to follow.

Week 3 added the Moon: the TLI ramp up from the Orbit, a far-side loop over the
top, and a crater to land the ball in. My first play left me underwhelmed. It
needed more colour, more pinball action, fly-overs, targets to build toward
multiball, and a bigger score. So three juice passes followed:

| Pass | Added |
| --- | --- |
| 1 | Rolling score with pop-ups, colour by room, L-E-M targets, QUAKE bumper, spinner, fly-overs, the LISSA start screen |
| 2 | Raised ramps with shadows, the GANTRY left ramp, SPACE JUNK, a livelier ring |
| 3 | Hit sparks, screen shake, callouts that punch in, a parallax starfield, lit-shot arrows |

After the third pass it played much better.

Week 4 took two notes from play. The low-gravity Moon was too easy, so every room
now runs at 1 g. And there was no way to lose the ball upstairs, so a black hole
now sits between each pair of mini flippers. On top of that:

- **Real locks and multiball:** two balls locked in the crater, then three balls
  in play.
- **Four missions:** each lights a lamp on the HUD.
- **ESCAPE:** a 30-second wizard mode behind the hatch.

> **Dead end:** At 0.16 g the Moon's flippers launched the ball at 1,300 to
> 1,700 px/s, so gravity barely mattered. Softer flippers made feathering a real
> skill, but the floaty ball still made the room too easy. In the end the low
> gravity went entirely.
