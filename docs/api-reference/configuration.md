---
sidebar_position: 13
title: Configuration and Queues
description: Queue configuration, independent queues, and iOS / Web Audio
---

# Configuration and Queues

```ts signature
setQueueConfig(config: Partial<QueueConfig>): void
getQueueConfig(): QueueConfig
setChannelQueueLimit(channelNumber: number, maxSize?: number): void
```

```ts
setQueueConfig({ defaultMaxQueueSize: 20, loadTimeoutMs: 10000, logger: null });
console.log(getQueueConfig().prefetchCount);
```

| Option                | Default   | Description                                                         |
| --------------------- | --------- | ------------------------------------------------------------------- |
| `debug`               | `false`   | Log every event (except progress) through `logger.debug`.           |
| `defaultMaxQueueSize` | unlimited | Items per channel, including the current one.                       |
| `dropOldestWhenFull`  | `false`   | Drop the oldest waiting item instead of rejecting a new one.        |
| `historySize`         | `20`      | Finished items kept per channel for `getHistory` (0 turns it off).  |
| `loadTimeoutMs`       | `15000`   | Skip an item that has not started after this long (0 disables).     |
| `logger`              | `console` | Where warnings and listener errors go; `null` silences the library. |
| `maxChannels`         | `64`      | Number of channels.                                                 |
| `pauseWhenHidden`     | `false`   | Pause while the page is hidden; resume when it is visible.          |
| `prefetchCount`       | `1`       | Waiting items preloaded ahead of the current one (not on iOS).      |
| `showQueueWarnings`   | `true`    | Warn when a queue limit is reached.                                 |
| `webAudio`            | `'auto'`  | When to use Web Audio: `'auto'`, `'force'` or `'off'`.              |

Invalid values throw a `RangeError` (for example a negative `prefetchCount`).

## Debugging

```ts
setQueueConfig({ debug: true });
```

Every event except progress is logged through `logger.debug` (`console.debug` by default) with its
channel and payload, so you can see what happened to a sound: queued, blocked by autoplay,
failed and why, started, paused, cue entered, completed with its reason.

```ts
// audioq [channel 0] queuechange { channelNumber: 0, items: [...], totalItems: 1, ... }
// audioq [channel 0] error { errorType: 'autoplay-blocked', fileName: 'click.mp3', ... }
// audioq [channel 0] start { fileName: 'click.mp3', duration: 300, ... }
```

## Independent queues

```ts signature
createAudioQueue(config?: Partial<QueueConfig>): AudioQueue
getDefaultAudioQueue(): AudioQueue
```

The top-level functions use a default queue, created on first use. `createAudioQueue` makes
another one with its own channels, listeners and configuration. Every top-level function has a
twin in `audioq/queue` with the same name that takes the queue as its first argument:

```ts
import { createAudioQueue, onAudioError, queueAudio, setQueueConfig } from 'audioq/queue';

const ui = createAudioQueue({ defaultMaxQueueSize: 3, dropOldestWhenFull: true, logger: null });
await queueAudio(ui, '/sfx/click.mp3');
onAudioError(ui, 0, (error) => console.warn(error.errorType));

const shared = getDefaultAudioQueue(); // the queue behind queueAudio(), pauseChannel(), ...
setQueueConfig(shared, { historySize: 50 });
```

A queue is an opaque value with no methods, so your bundler keeps only the functions you import.

Separate queues are handy for embedded widgets, multiple players on a page, and tests (each test
can create its own queue).

## iOS and Web Audio

iOS ignores `HTMLAudioElement.volume`, so volume, fades, ducking and crossfades need the Web
Audio API there.

| `webAudio`      | Behaviour                                                                   |
| --------------- | --------------------------------------------------------------------------- |
| `'auto'`        | On iOS, route a sound while its volume is between 0 and 1. Elsewhere, do not. |
| `'force'`       | Route everywhere (same-origin or CORS audio).                               |
| `'off'`         | Never use Web Audio.                                                        |

In `'auto'` mode, audio at full volume stays native on iOS on purpose. iOS has long-standing bugs
with audio routed through Web Audio: it stops when the phone locks (the lock-screen controls
appear but play is silent). Resuming a paused element is unreliable on iOS too: it skips about
half a second, or replays buffered audio when routed, so on iOS AudioQ resumes by reloading the
element and seeking back to the paused position.
So a podcast or music player that leaves volume alone keeps lock-screen and background playback,
while a game that sets volumes gets them. Muting uses the element's `muted` flag, which iOS
honours, so it needs no routing. Panning and `getChannelAnalyser` route on every platform.

iOS also only lets an audio element play without a tap if it has played before, so a sound that
starts when the previous one ends can be refused. AudioQ keeps a few elements that have played and,
when iOS refuses an item, moves it onto one of them and retries, so queues keep going. Upcoming
items are not preloaded on iOS (`prefetchCount` is ignored there): an element that loads in the
background while another one plays can report that it is playing and never advance, so each
item's element is created when its turn comes.

Web Audio can only read audio from another origin if the server sends CORS headers and the item
is queued with `crossOrigin: 'anonymous'`. Without that, AudioQ plays the file normally (at full
volume on iOS) rather than routing it into silence.

```ts
await queueAudio('https://cdn.example.com/music.mp3', 0, { crossOrigin: 'anonymous' });
console.log(getWebAudioSupport()); // { available, isIOS, usingWebAudio, reason }
```

All routing shares one `AudioContext`, created when first needed and closed by
`destroyAllChannels()`. An iOS context interrupted by a phone call is resumed on the next user
gesture.

## Server-side rendering

Importing AudioQ has no side effects and the default queue is only created on first use, so it is
safe to import on the server. `queueAudio` rejects there with an explanation. Note that the
default queue is shared by every request on a server, so configure it in the browser.
