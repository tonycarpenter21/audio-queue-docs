---
sidebar_position: 1
title: Queueing and Stopping
description: queueAudio, queueAudioPriority and the stop and destroy functions
---

# Queueing and Stopping

## queueAudio

```ts signature
queueAudio(source: AudioSource, channelNumber?: number, options?: AudioQueueOptions): Promise<QueuedAudio>
```

Adds audio to a channel (default 0) and starts it if the channel is idle. `source` is a URL
(relative, absolute, `blob:`, `data:`, or a custom scheme like `capacitor://`) or a `Blob`/`File`.

```ts
await queueAudio('/sfx/click.mp3');
await queueAudio('https://cdn.example.com/music.mp3', 1, { loop: true, volume: 0.5 });
const file = new File(['...'], 'note.webm', { type: 'audio/webm' });
await queueAudio(file, 2); // object URL created and revoked for you
```

It resolves as soon as the item is queued, with a handle:

```ts
const item: QueuedAudio = await queueAudio('/voice/intro.mp3');
item.id; // matches QueueItem.id and every event's id
item.src; // resolved URL
await item.started; // true once it plays, false if it never does
await item.finished; // 'ended' | 'stopped' | 'error' | 'removed' | 'skipped'
```

It rejects with a `TypeError` for an empty or non-string source, a `RangeError` for an invalid
channel or option, and an `Error` when the queue limit is reached (unless `dropOldestWhenFull`).

### Options

| Option         | Type                                | Description                                                            |
| -------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| `addToFront`   | `boolean`                           | Play right after the current item.                                     |
| `interrupt`    | `boolean`                           | Stop and clear the channel, then play this now.                        |
| `dedupeMs`     | `number`                            | Ignore if the same source was queued on the channel this recently.     |
| `loop`         | `boolean`                           | Repeat until stopped.                                                  |
| `volume`       | `number` (0-1)                      | Item volume, multiplied with channel and global volume.                |
| `playbackRate` | `number` (0.25-4)                   | Item speed, pitch preserved; multiplied with the channel speed.        |
| `startAt`      | `number` (ms)                       | Start this far into the file.                                          |
| `endAt`        | `number` (ms)                       | End here as if the file ended (segments, sprites).                     |
| `cues`         | `AudioCue[]`                        | Timed cues that fire `onAudioCue`.                                     |
| `metadata`     | `AudioMetadata`                     | Title, artist, artwork, and any of your own fields.                    |
| `maxQueueSize` | `number`                            | Queue limit for this call only.                                        |
| `crossOrigin`  | `'anonymous' \| 'use-credentials'` | CORS mode, needed for iOS volume control of cross-origin files.        |

## queueAudioPriority

```ts signature
queueAudioPriority(source: AudioSource, channelNumber?: number, options?: AudioQueueOptions): Promise<QueuedAudio>
```

The same as `queueAudio` with `addToFront: true`.

```ts
await queueAudioPriority('/sfx/alert.mp3', 0);
```

## stopCurrentAudioInChannel

```ts signature
stopCurrentAudioInChannel(channelNumber?: number): Promise<void>
```

Stops the current item (its `finished` settles with `'stopped'`) and starts the next one, even if
the channel was paused.

## stopAllAudioInChannel and stopAllAudio

```ts signature
stopAllAudioInChannel(channelNumber?: number): Promise<void>
stopAllAudio(): Promise<void>
```

Stop the current item and remove everything queued. The channel keeps its settings and listeners.
The current item reports `'stopped'`, waiting items `'removed'`.

## destroyChannel and destroyAllChannels

```ts signature
destroyChannel(channelNumber?: number): Promise<void>
destroyAllChannels(): Promise<void>
```

`destroyChannel` also forgets the channel's settings and listeners. `destroyAllChannels` resets
everything: all channels and listeners, global volume, ducking, and the shared `AudioContext`.
The queue stays usable afterwards.

All stop and destroy functions take effect immediately, even without `await`, so audio queued
right after them is never affected.

```ts
void destroyAllChannels();
await queueAudio('/music/menu.mp3'); // plays normally
```
