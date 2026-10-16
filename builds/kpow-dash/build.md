---
slug: kpow-dash
title: kpow-dash
status: active
kind: software
summary: One local dashboard for everything kpow, with Claude on hand to change it.
stack: [TypeScript, Hono, SQLite, React, Vite, Claude Agent SDK, Google APIs, MQTT]
tags: [dashboard, local-first, claude]
repo: kpow/kpow-dash
facts:
  tiles: 9
  collectors: 10
  selfEdits: 14
hero: media/hero.jpg
started: 2026-10-15
---

One screen for everything I have going at once, running on this Mac and nowhere else.
It knows my calendars and mail, the sites I host and what DigitalOcean charges for
them, the ESP32 and WLED devices on the LAN, the Bambu P2S and the models queued for
it, this build log, what I am listening to, what Claude Code costs me, and the apps I
wrote and then forgot about.

## Scripts keep it running, Claude doesn't

Ten collectors run on their own timers and write snapshots into one SQLite file in
Application Support. Every tile reads from that file and nothing else, so the page
opens instantly, still shows the last good data when the wifi drops, and costs nothing
to leave up all day. Claude runs only when I type a question or ask for a change.

| Tile | Reads |
|---|---|
| Today | Google Calendar, two accounts |
| Inbox | Gmail, two accounts |
| Hosted | Site pings and DigitalOcean |
| 3D + printing | ~/projects/3d and the P2S |
| Hardware | mDNS, WLED and viz endpoints |
| Build log | This repo's status script |
| Listening | kpow.xyz's Spotify mirror |
| Claude usage | ~/.claude transcripts |
| Launchpad | A registry plus git dates |

## The launchpad is half the point

The thing I actually needed was a place for the apps that fall out of my head. Every
app in the registry shows when it was last touched, wears a tilted "dusty!" sticker
after 30 days, and opens one of three ways: a hosted URL, a local command with a
running or stopped dot, or a Claude Code skill in the right folder.

## It changes itself

The panel has three modes. **Ask** answers from the dashboard's own snapshots plus the
kpow MCP. **Change: preview** edits a `dash/<slug>` branch in its own git worktree and
serves it on :4042, so main doesn't move until I keep it. **Change: apply now** goes
straight onto main, with `git revert` behind the undo button.

Claude gets file edits inside that worktree and exactly one command, `npx tsc
--noEmit`. No network, no git, no secrets, nothing from `~/.claude`. The typecheck
gates preview, keep and apply, and a failure undoes the change and says why.

## Design and secrets

The look is direction D of four mockups: 2px black borders with hard shadows, lowercase
chunky display type off kpow.xyz, tilted stickers, and the DigitalOcean bill drawn as a
price tag.

Every token lives in the macOS Keychain, never in the repo. The DigitalOcean one is
read-only, which is why the dash can tell me a retired app is still billing but cannot
go destroy it.
