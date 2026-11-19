---
sidebar_position: 3
title: Events
description: Listening to playback, queue, error and cue events
---

# Events

Every event is scoped to a channel. Subscribing returns a function that removes exactly that
listener; `off*` functions remove listeners by channel.

```ts
const unsubscribe = onAudioStart(0, (info) => console.log('started', info.fileName));
unsubscribe(); // removes only this listener

const onDone = (info: AudioCompleteInfo): void => console.log(info.reason);
onAudioComplete(0, onDone);
offAudioComplete(0, onDone); // removes this callback
offAudioComplete(0); // removes every complete listener on channel 0
```

## The events

| Subscribe          | Fires when                                         | Payload                         |
| ------------------ | -------------------------------------------------- | ------------------------------- |
| `onAudioStart`     | an item starts playing (once per play-through)     | `AudioStartInfo`                |
| `onAudioComplete`  | an item leaves the front (ended, stopped, error)   | `AudioCompleteInfo`             |
| `onAudioProgress`  | the position changes (about 4 times per second)    | `AudioInfo`                     |
| `onAudioPause`     | the channel pauses (you, a fade, or the OS)        | `(channelNumber, AudioInfo)`    |
| `onAudioResume`    | the channel resumes (you, or the lock screen)      | `(channelNumber, AudioInfo)`    |
| `onQueueChange`    | items are added, removed, reordered or advance     | `QueueSnapshot`                 |
| `onAudioError`     | an item fails, times out, or autoplay is blocked   | `AudioErrorInfo`                |
| `onAudioCue`       | playback enters or leaves a cue                    | `AudioCueInfo`                  |

Every payload carries the item's `id`, `src`, `fileName` and your `metadata`, so you can match
events to your own data.

```ts
await queueAudio('/voice/msg-17.mp3', 2, { metadata: { messageId: 17 } });
onAudioComplete(2, (info) => {
  console.log('message', info.metadata?.['messageId'], info.reason, info.playedMs);
});
```

## Order

For one item: `onQueueChange` (queued) → `onAudioStart` → `onAudioProgress`… → `onAudioComplete`
→ `onQueueChange` (removed) → the next item's `onAudioStart`. The complete event fires before the
item's `finished` promise settles.

## Listener errors

A listener that throws never breaks playback or other listeners. The error is passed to the
configured logger (`console` by default; `logger: null` silences it).

## Listening across channels

Subscribe on each channel you care about. Because every `on*` returns its unsubscribe function,
it is easy to manage several:

```ts
const offs = [0, 1, 2].map((channel) =>
  onAudioError(channel, (error) => console.warn(channel, error.errorType))
);
offs.forEach((off) => off());
```

## Pauses you did not start

When a phone call, unplugged headphones, Siri or the lock screen pauses audio, the channel reports
as paused and `onAudioPause` fires. Pressing play on the lock screen fires `onAudioResume`. Your
UI stays in sync without extra code.
