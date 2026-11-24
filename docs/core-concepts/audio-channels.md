---
sidebar_position: 1
title: Audio Channels
description: How channels let sounds play side by side
---

# Audio Channels

A **channel** is an independent lane of audio. Each channel has its own:

- queue (items play one after another),
- volume, playback speed, repeat mode, gap and crossfade settings,
- pause state,
- event listeners,
- history.

Sounds on **different channels play at the same time**; sounds on the **same channel take turns**.
Channels are numbered from 0 to 63 (`MAX_CHANNELS` is 64; change it with the `maxChannels`
option). Channel 0 is the default for every function that takes a channel.

```ts
const MUSIC = 0;
const EFFECTS = 1;
const VOICE = 2;

await queueAudio('/music/theme.mp3', MUSIC, { loop: true });
await queueAudio('/sfx/door.mp3', EFFECTS);
await queueAudio('/voice/welcome.mp3', VOICE);
```

Channels are created the first time you use them and cost nothing while idle. Invalid channel
numbers (negative, fractional, `NaN`, or `maxChannels` and above) throw a `RangeError`.

## Choosing channels

| Kind of sound                        | Suggested setup                                                 |
| ------------------------------------ | --------------------------------------------------------------- |
| Background music                     | Its own channel, `loop: true` or `setRepeatMode(n, 'all')`      |
| Voice, narration, text-to-speech     | Its own channel; make it the ducking priority channel            |
| UI and notification sounds           | Its own channel with `dedupeMs`                                 |
| Overlapping effects (gunfire, steps) | Two or three channels you rotate through, or `interrupt: true`  |

## Channel settings

```ts
await setChannelVolume(0, 0.5);
setPlaybackRate(2, 1.25);
setRepeatMode(0, 'all');
setChannelGap(2, 500);
setCrossfade(0, 3000);
setChannelQueueLimit(1, 5);
console.log(getChannelVolume(0), getPlaybackRate(2), getRepeatMode(0), getChannelGap(2));
```

## Cleaning up

```ts
await stopAllAudioInChannel(1); // stop and clear, keep settings and listeners
await destroyChannel(1); // also forget its settings and listeners
await destroyAllChannels(); // reset everything, including global volume and ducking
```

All three take effect immediately, even without `await`.

## Several independent queues

The top-level functions all use one shared default queue. `createAudioQueue()` makes another with
its own channels and configuration, for embedded widgets, multiple players, or tests. Use it with
the functions of `audioq/queue`, which take the queue as their first argument:

```ts
import { createAudioQueue, queueAudio } from 'audioq/queue';

const ui = createAudioQueue({ defaultMaxQueueSize: 3, dropOldestWhenFull: true });
const player = createAudioQueue({ historySize: 100, pauseWhenHidden: true });
await queueAudio(ui, '/sfx/click.mp3');
await queueAudio(player, '/music/track-1.mp3');
```
