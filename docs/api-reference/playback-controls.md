---
sidebar_position: 3
title: Playback Controls
description: Seeking, speed, resume position, repeat, gaps, crossfade and history
---

# Playback Controls

## Seeking

```ts signature
seekTo(channelNumber: number, positionMs: number): boolean
seekBy(channelNumber: number, offsetMs: number): boolean
```

Both return `false` when nothing is playing or the position is not a finite number. Positions are
clamped to the item's length.

```ts
seekTo(0, 60000); // 1:00
seekBy(0, 15000); // forward 15 s
seekBy(0, -15000); // back 15 s
```

## Start position

Use `startAt` to resume where a listener left off:

```ts
const saved = Number(localStorage.getItem('episode-42') ?? 0);
await queueAudio('/episodes/42.mp3', 0, { startAt: saved });
onAudioProgress(0, (info) => localStorage.setItem('episode-42', String(info.currentTime)));
```

## Speed

```ts signature
setPlaybackRate(channelNumber: number, rate: number): void
getPlaybackRate(channelNumber?: number): number
```

Speeds are clamped to `PLAYBACK_RATE_RANGE` (0.25 to 4) and keep the pitch. An item's own
`playbackRate` option multiplies the channel speed.

```ts
setPlaybackRate(0, 1.5);
await queueAudio('/slow-intro.mp3', 0, { playbackRate: 0.8 }); // plays at 1.2
console.log(getPlaybackRate(0), getCurrentAudioInfo(0)?.playbackRate);
```

## Repeat

```ts signature
setRepeatMode(channelNumber: number, mode: RepeatMode): void
getRepeatMode(channelNumber?: number): RepeatMode
```

| Mode    | When an item ends                                   |
| ------- | --------------------------------------------------- |
| `'off'` | The next item plays (default).                      |
| `'one'` | The same item plays again.                          |
| `'all'` | The item moves to the end, so the queue repeats.    |

Stopped and failed items are not repeated.

## Gaps

```ts signature
setChannelGap(channelNumber: number, gapMs: number): void
getChannelGap(channelNumber?: number): number
```

Adds silence between items, for example between quiz questions or language-course phrases.

```ts
setChannelGap(2, 1500);
```

## Crossfade

```ts signature
setCrossfade(channelNumber: number, crossfadeMs: number): void
getCrossfade(channelNumber?: number): number
```

Near the end of each item the next one starts and fades in while the current one fades out. The
overlap is at most half of an item's length, and is not used for looping items or with repeat
mode `'one'`. A short crossfade (about 50 ms) hides the small gap between tracks.

```ts
setCrossfade(0, 4000);
```

## History

```ts signature
getHistory(channelNumber?: number): HistoryEntry[]
clearHistory(channelNumber?: number): void
```

The last `historySize` (default 20) finished items per channel, oldest first. Each entry has the
item's `id`, `src`, `fileName`, `metadata`, the `reason` it finished, `playedMs`, and `finishedAt`.

```ts
for (const entry of getHistory(0)) {
  const completed = entry.reason === 'ended';
  console.log(entry.fileName, completed ? 'finished' : `stopped after ${entry.playedMs} ms`);
}
setQueueConfig({ historySize: 100 }); // 0 turns history off
```
