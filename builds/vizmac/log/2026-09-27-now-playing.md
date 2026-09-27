---
date: 2026-09-27
title: "Now Playing with a rainbow EQ, and a focus clock"
tags: [now-playing, clock]
media:
  - { src: media/now-playing-eq.jpg }
  - { src: media/now-playing-paused.jpg }
  - { src: media/clock-face.jpg }
---
**Now Playing** reads Spotify and Music through JavaScript for Automation, only when one is already running. The Mac sends the album art as 120×120 RGB565.

- **Knob:** turn to skip. Turns add up ("Next ×3") and go out when the knob rests. Volume stays on the keyboard's own knob.
- **LEDs:** album art on a 16×8 was unreadable, so the panel is a 16-band EQ in a chosen palette, rainbow by default. vizMac listens to Mac audio only while the EQ shows.

**Clock** started as big Slackey digits. The LEDs already showed the digital time, so the screen became an analog face: an amethyst hour hand, an emerald minute hand, and the focus timer as a draining teal arc. When the timer ends, the controller and the keyboard flash green.

> **Trap:** NTP never set the clock. The Mac now sends its time and time zone with every poll.
