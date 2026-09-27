---
date: 2026-09-25
title: "Controller firmware: Dock UI, then rendering on the device"
tags: [esp32, firmware, ui]
media:
  - { src: media/keyboard-vortex.mp4, poster: media/keyboard-vortex.jpg }
  - { src: media/knob-through-effects.mp4, poster: media/knob-through-effects.jpg }
---
Plan steps 3 to 5 all landed the same day:

- **Finding vizKeys:** Wi-Fi access on the Mac with a 6-character pairing code, advertised over Bonjour. The controller found it in one lookup and loaded all 25 effects.
- **UI:** a design agent drew three concepts at 240x320 portrait, rendered with the real TFT_eSPI fonts. I picked A, "Dock": home, quick menu, effect browser, tune, palette picker and status screens, with Slackey for titles.
- **Knob:** turns pick the effect, applied once it rests for 350 ms. Networking runs on core 0 so the UI on core 1 never blocks.
- **LED preview:** vizKeys streamed a 16x8 DDP preview of the keyboard to the two panels at 30 fps.

Streaming pixels over Wi-Fi looked chunky. vizKeys now sends a small sync packet each frame (clock, audio, keypresses) instead, and the controller runs the Noodle effects and ported built-ins itself at 40 fps on both the screen and the panels. A frozen rainbow matched the Mac exactly.

With the panels showing the effect, the mini keyboard on the home screen was redundant, so it came out.

> **Lesson:** don't stream pixels to a device that can render. Send the clock and the inputs and let it draw.
