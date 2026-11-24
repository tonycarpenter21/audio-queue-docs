---
sidebar_position: 1
title: Welcome to AudioQ
description: Queue audio files on independent channels in the browser. Zero dependencies.
---

# AudioQ

<div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
  <a href="https://www.npmjs.com/package/audioq" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/npm/v/audioq?style=flat-square&logo=npm&label=version" alt="NPM Version" />
  </a>
  <a href="https://github.com/tonycarpenter21/audioq" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/github/stars/tonycarpenter21/audioq?style=flat-square&logo=github" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/tonycarpenter21/audioq/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/npm/l/audioq?style=flat-square" alt="License" />
  </a>
</div>

AudioQ plays audio files in order on independent **channels**: sound effects, music and voice can
run at the same time without interrupting each other, while each channel keeps its own queue,
volume, pause state and events. It has zero dependencies, ships its own TypeScript types, and is
about 11 KB minified and gzipped with every feature.

```bash
npm install audioq
```

```ts
import { queueAudio, onAudioComplete } from 'audioq';

await queueAudio('/music/theme.mp3', 0, { loop: true, volume: 0.4 }); // channel 0: music
await queueAudio('/sfx/coin.mp3', 1); // channel 1: effects, plays alongside
onAudioComplete(1, (info) => console.log(`${info.fileName} finished (${info.reason})`));
```

## What you can build

| You are building                 | AudioQ gives you                                                            |
| -------------------------------- | --------------------------------------------------------------------------- |
| A game                           | Channels for music, effects and voice; sprites; ducking; crossfades         |
| Notification sounds in a web app | `dedupeMs` for bursts, `interrupt` for urgent sounds, autoplay unlocking    |
| A voice assistant or AI chat     | Queue generated `Blob` clips, barge-in with `interrupt`, caption cues       |
| A podcast or music player        | Seek, speed, resume position, repeat, shuffle, history, lock-screen buttons |
| Learning or accessibility tools  | Timed cues for captions and highlights, WebVTT import                       |

## Highlights

- **Independent channels** (0-63), each with its own queue, volume, pause state and events.
- **Reliable by design**: one error report per failure, autoplay blocking keeps the queue and
  resumes on the next tap, a load timeout so nothing hangs, and OS pauses (calls, headphones,
  lock screen) keep the state in sync.
- **Volume that composes**: channel × item × global × ducking × fade, never overwriting each other.
- **Fades, ducking and crossfades**, all timer-based so they finish in background tabs.
- **Sprites, cues and captions**, timed precisely rather than at the browser's 4-per-second updates.
- **Lock-screen controls** through the Media Session API.
- **Safe for server-side rendering**: importing has no side effects.
- **Two styles**: top-level functions for the common case, and `audioq/queue` (the same functions,
  queue first) for independent queues and tests.

## Next steps

- [Installation](getting-started/installation)
- [Quick Start](getting-started/quick-start)
- [Recipes](getting-started/basic-usage) for notifications, voice, games and podcasts
- [React](getting-started/react-integration)
- [Migrating from 2.x](migration/migrating-from-v2)
- [Live demo](https://tonycarpenter21.github.io/audio-queue-demo/queue-management)
