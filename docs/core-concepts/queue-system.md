---
sidebar_position: 2
title: The Queue
description: How items are queued, played, preloaded and released
---

# The Queue

Each channel's queue is a list in play order. **Index 0 is the current item**; waiting items start
at index 1.

```ts
await queueAudio('/a.mp3'); // index 0, plays now
await queueAudio('/b.mp3'); // index 1
await queueAudio('/c.mp3', 0, { addToFront: true }); // goes to index 1, ahead of b
console.log(getQueueSnapshot(0)?.items.map((item) => item.fileName)); // ['a.mp3', 'c.mp3', 'b.mp3']
```

## What happens when you queue

1. The source is checked: a non-empty URL string or a `Blob`/`File`, otherwise `TypeError`.
2. Options are checked (`maxQueueSize`, `endAt`, `cues`), otherwise `RangeError`.
3. With `dedupeMs`, a repeat of a recent source is skipped (the handle settles with `'skipped'`).
4. With `interrupt`, the channel is cleared first.
5. The queue limit is applied (see below).
6. The item is added and `onQueueChange` fires. If the channel was idle, it starts playing.

The returned handle resolves right away:

```ts
const item = await queueAudio('/voice/line.mp3', 2);
console.log(item.id, item.src, item.channelNumber);
await item.started; // true once playback starts, false if it never does
await item.finished; // 'ended' | 'stopped' | 'error' | 'removed' | 'skipped'
```

Both promises always settle, so awaiting them never hangs.

## Preloading

Only the current item and the next one (`prefetchCount`, default 1) get an audio element and start
downloading. A 100-item playlist does not download 100 files. Items that move out of that window
(after reordering or a priority insert) release their element again. On iOS nothing is preloaded:
each item's element is created when its turn comes, because iOS can stall an element that loaded
in the background (see [iOS and Web Audio](../api-reference/configuration.md#ios-and-web-audio)).

## Limits

A channel can be limited to a number of items (including the current one):

```ts
setQueueConfig({ defaultMaxQueueSize: 20 }); // every channel
setChannelQueueLimit(3, 5); // channel 3
await queueAudio('/sfx/ping.mp3', 3, { maxQueueSize: 2 }); // this call only
setQueueConfig({ dropOldestWhenFull: true }); // drop the oldest waiting item instead of throwing
```

When the limit is hit `queueAudio` rejects, unless `dropOldestWhenFull` is set. The current item
is never dropped.

## Rearranging

```ts
await reorderQueue(3, 1); // move item 3 to play next
await swapQueueItems(1, 2);
await removeQueuedItem(2);
await shuffleQueue(0);
await clearQueueAfterCurrent(0);
```

These return `{ success, error?, updatedQueue? }` and never throw. The current item (index 0)
cannot be moved or removed; stop it instead.

## Moving on

An item leaves the front of the queue when it:

| Event                              | `reason`/outcome | Next item                               |
| ---------------------------------- | ---------------- | --------------------------------------- |
| plays to the end (or `endAt`)      | `'ended'`        | starts (after the gap, if one is set)   |
| is skipped with `stopCurrentAudioInChannel` | `'stopped'` | starts                               |
| fails to load or play              | `'error'`        | starts                                  |
| is cleared by `stopAllAudioInChannel` or `interrupt` | `'stopped'` | -                           |

If the channel is paused when an item ends or fails, the next item waits paused.

## Repeating

```ts
setRepeatMode(0, 'one'); // replay the current item
setRepeatMode(0, 'all'); // each finished item goes to the end of the queue
setRepeatMode(0, 'off');
```

`loop: true` on an item repeats just that item until it is stopped.

## Memory

Finished, stopped and removed items release their audio element, network request, Web Audio
nodes, listeners and timers, and `Blob` object URLs are revoked. Nothing accumulates in long
sessions; only the last `historySize` history entries (default 20) are kept.
