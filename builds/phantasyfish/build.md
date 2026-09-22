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
Fantasy sports for Phish setlists. You predict a show before the band plays, then
score on how close you got. I built and run the whole thing: the game, the
automated scoring, an AI that drafts setlists from history, the leaderboards, and
the email that ties it together. It's been live and played for over a year.

Full-stack TypeScript, React over Express and PostgreSQL with Drizzle. The
scoring engine fires automatically the moment the official setlist posts, and
hands out bonuses for:

- the right song
- the right set
- the exact position in that set
- openers and closers
- bustouts, shared with everyone who called them

**WookBot** is an OpenAI setlist generator built on historical play patterns.
Around it sit leaderboards (global, tour, show), research tools, an admin
console, and transactional email.

## Year one

| | |
|---|---|
| Players | 115, across 6 tours and 28 venues |
| Shows scored | 74 |
| Predictions | 1,155 |
| Points earned | 65,054 |
| Top score | 248 |
| Exact positions called | 398 |
| Songs in the right set | 2,501 |
| Bustouts called | 99 |
| WookBot setlists | 67 |
| Song catalog | 959 |
