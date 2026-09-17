---
slug: phantasyfish
title: PhantasyFish
status: live
kind: software
summary: Fantasy sports for Phish setlists.
stack: [React, TypeScript, Express, PostgreSQL, Drizzle, OpenAI, Resend, DigitalOcean]
tags: [web, fullstack, phish]
repo: kpow/phantasyphish
facts:
  players: 115
  shows: 74
  predictions: 1155
  points: 65054
hero: media/hero.jpg
links:
  - { label: site, url: https://phantasyfish.com }
  - { label: repo, url: https://github.com/kpow/phantasyphish }
started: 2025-04-12
---

Fantasy sports for Phish setlists — you predict a show before the band plays, then
score on how close you got. I built and run the whole stack: the game itself, the
automated scoring engine, an AI that drafts setlists from history, leaderboards, and
the email that ties it together. It's been live and played for over a year.

Under the hood it's full-stack TypeScript — a React front end over Express and
PostgreSQL with Drizzle ORM. The **scoring engine** hands out song, set,
exact-position, opener–closer, and shared-bustout bonuses, and it fires
automatically the moment the official setlist posts. **WookBot** is an OpenAI setlist
generator built on historical play patterns, and around all of it sit leaderboards
(global / tour / show), research tools, an admin console, and transactional email.

## By the numbers (year one)

115 players across 6 tours and 28 venues · 74 shows scored · 1,155 predictions ·
65,054 points · 248 top score · **398 exact song positions nailed** · 2,501 songs
placed in the right set · 99 bustouts · 67 AI-generated setlists · a 959-song catalog.
