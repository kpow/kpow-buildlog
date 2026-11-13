---
slug: mosaico
title: ESP-Mosaico
status: active
kind: hybrid
summary: Apps for Espressif's modular ESP32-S31 kit: a square AMOLED with snap-on modules.
stack: [ESP32-S31, ESP-IDF, ESP-GSP, FreeRTOS]
tags: [display, firmware, esp-mosaico]
facts:
  screen: 2.16in 480x480
  apps: 1
hero: media/esp-mosaico.jpg
links:
  - { label: kit docs, url: https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s31/esp-mosaico/user_guide.html }
  - { label: workspace, url: https://github.com/esp-mosaico/esp-mosaico-vibe }
started: 2026-11-12
---
Everything I build for Espressif's ESP-Mosaico lives here. It's a small dev kit
around the ESP32-S31: a dual-core RISC-V chip at up to 320 MHz with 16 MB of
PSRAM, behind a 2.16" 480×480 square AMOLED touchscreen. It also carries an IMU,
a vibration motor and a battery. Modules snap onto its left and right sides: a
camera, and an Interaction Module with two keys and a Function button.

## How apps get made

Every app starts in the esp-mosaico-vibe workspace with `mosaico.py project init`.
The UI is an ESP-GSP scene, and the same scene and C code run in a PC simulator
and on the device. So most of the work happens in the simulator, and hardware
comes in only for what the simulator can't cover: frame rate, the camera, the
motor, touch.

The kit keeps a retained firmware called Vibe Mode. It installs apps over USB
and is where an app exits back to.

## Apps

- **Kaleido:** a live kaleidoscope. Generative sources, the camera, or images
  from a phone page at `kaleido.local`.
