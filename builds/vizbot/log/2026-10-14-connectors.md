---
date: 2026-10-14
title: "vizBot knows about me: connectors and kpow-mcp"
tags: [vizbrain, mcp, connectors]
media: []
---
vizBot's brain only knew me through 60 remembered facts and web search. Now each vizbrain install can plug in MCP servers listed in its own `connectors.json`, so my bot and a friend's can know different things. With none listed, nothing changes.

The first one is kpow-mcp, fed by this site's public JSON and a private profile file on my Mac. It covers projects and this build log, vizBot releases, the music I play, the books I've read and the shows I've been to.

- **Out loud:** he says "let me check" while a look-up runs. Each question gets at most 4 look-ups and 15 seconds.
- **Guard rails:** connector results are labelled as data. After one, he won't change his memory or routines in the same answer.
- **Names:** kpow-mcp builds a name index from the live data for speech-to-text, plus a sound-alike lookup.

A 10-question voice test came back 9 of 10. Whisper heard "Soul Siblings" as "sole siblings" twice. With the name index the next try heard it right, and he started answering in 1.5 s.
