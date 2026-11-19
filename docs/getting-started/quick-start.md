---
sidebar_position: 2
title: Quick Start
description: Queue, control and react to audio in a few minutes
---

# Quick Start

## 1. Queue some audio

```ts
import { queueAudio } from 'audioq';

await queueAudio('/sfx/hello.mp3'); // plays now on channel 0
await queueAudio('/sfx/world.mp3'); // plays after hello.mp3
```

`queueAudio(source, channel?, options?)` resolves as soon as the item is queued. It returns a
handle you can wait on:

```ts
const item = await queueAudio('/voice/intro.mp3');
if (await item.started) console.log('playing');
console.log(await item.finished); // 'ended' | 'stopped' | 'error' | 'removed' | 'skipped'
```

## 2. Use channels for audio that overlaps

Each channel has its own queue. Sounds on the same channel take turns; sounds on different
channels play at the same time.

```ts
await queueAudio('/music/theme.mp3', 0, { loop: true, volume: 0.4 });
await queueAudio('/sfx/explosion.mp3', 1);
await queueAudio('/voice/mission.mp3', 2);
```

## 3. Control playback

```ts
await pauseChannel(0);
await resumeChannel(0);
await pauseWithFade(FadeType.Gentle, 0); // fade out, then pause
await resumeWithFade(); // fade back in
await setChannelVolume(1, 0.5);
await setGlobalVolume(0.8);
await stopCurrentAudioInChannel(2); // skip to the next item
await stopAllAudio();
```

## 4. React to events

Every `on*` function returns a function that removes that listener.

```ts
const offStart = onAudioStart(0, (info) => console.log('now playing', info.fileName));
const offProgress = onAudioProgress(0, (info) => console.log(Math.round(info.progress * 100)));
const offErrors = onAudioError(0, (error) => console.warn(error.errorType, error.fileName));

offStart();
offProgress();
offErrors();
```

## 5. Handle autoplay

Browsers block audio until the user interacts with the page. AudioQ keeps blocked sounds queued
and plays them on the first click, tap or key press, reporting one `AutoplayBlocked` error per
item so you can show a hint. Nothing extra is needed, but you can start audio from your own
button too:

```ts
const startButton = document.createElement('button');
startButton.addEventListener('click', () => unlockAudio());
```

## Next

- [Recipes](basic-usage): notifications, voice assistants, games, podcasts
- [Core concepts](../core-concepts/audio-channels)
- [API reference](../api-reference/quick-reference)
