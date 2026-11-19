---
sidebar_position: 8
title: Event Listeners
description: Subscribing to and removing AudioQ events
---

# Event Listeners

Every `on*` function takes a channel and a callback and **returns a function that removes that
listener**. Every `off*` function takes a channel (default 0) and optionally the callback to
remove; without one it removes every listener of that kind on the channel. See
[Events](../core-concepts/event-system) for when each fires.

```ts signature
onAudioStart(channelNumber: number, callback: AudioStartCallback): Unsubscribe
onAudioComplete(channelNumber: number, callback: AudioCompleteCallback): Unsubscribe
onAudioProgress(channelNumber: number, callback: ProgressCallback): Unsubscribe
onAudioPause(channelNumber: number, callback: AudioPauseCallback): Unsubscribe
onAudioResume(channelNumber: number, callback: AudioResumeCallback): Unsubscribe
onQueueChange(channelNumber: number, callback: QueueChangeCallback): Unsubscribe
onAudioError(channelNumber: number, callback: AudioErrorCallback): Unsubscribe
onAudioCue(channelNumber: number, callback: AudioCueCallback): Unsubscribe
```

```ts
const off = [
  onAudioStart(0, (info) => console.log('start', info.fileName, info.duration)),
  onAudioComplete(0, (info) => console.log('done', info.reason, info.remainingInQueue)),
  onAudioProgress(0, (info) => console.log(info.currentTime, info.progress)),
  onAudioPause(0, (channel, info) => console.log('paused', channel, info.currentTime)),
  onAudioResume(0, (channel) => console.log('resumed', channel)),
  onQueueChange(0, (snapshot) => console.log(snapshot.totalItems)),
  onAudioError(0, (error) => console.warn(error.errorType, error.error.message)),
  onAudioCue(0, (cue) => console.log(cue.active, cue.cue.text))
];
off.forEach((unsubscribe) => unsubscribe());
```

```ts
offAudioStart(0);
offAudioComplete(0);
offAudioProgress(0);
offAudioPause(0);
offAudioResume(0);
offQueueChange(0);
offAudioError(0);
offAudioCue(0);
```

## Payloads

| Event      | Payload fields                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------- |
| start      | `channelNumber`, `duration`, `fileName`, `id`, `metadata`, `src`                                |
| complete   | `channelNumber`, `fileName`, `id`, `metadata`, `playedMs`, `reason`, `remainingInQueue`, `src`  |
| progress, pause, resume | `AudioInfo` (see [Audio Information](audio-information))                       |
| queue      | `QueueSnapshot`                                                                                 |
| error      | `channelNumber`, `error`, `errorType`, `fileName`, `id`, `metadata`, `remainingInQueue`, `src`, `timestamp` |
| cue        | `active`, `channelNumber`, `cue`, `fileName`, `id`, `index`, `metadata`, `src`                  |

All times are in milliseconds. `fileName` is plain text (not HTML-escaped).

Subscribing to an invalid channel throws a `RangeError`. A listener that throws is logged and does
not affect other listeners or playback.
