---
sidebar_position: 2
title: Rearranging the Queue
description: Remove, reorder, swap, shuffle and inspect queued items
---

# Rearranging the Queue

Index 0 is the current item and cannot be moved or removed (stop it instead). Waiting items start
at index 1. These functions return a `QueueManipulationResult` and never throw:

```ts
interface QueueManipulationResult {
  error?: string;
  success: boolean;
  updatedQueue?: QueueSnapshot;
}
```

## removeQueuedItem

```ts signature
removeQueuedItem(queuedSlotNumber: number, channelNumber?: number): Promise<QueueManipulationResult>
```

```ts
const result = await removeQueuedItem(2);
if (!result.success) console.warn(result.error);
```

The removed item's `finished` settles with `'removed'`.

## reorderQueue

```ts signature
reorderQueue(currentQueuedSlotNumber: number, newQueuedSlotNumber: number, channelNumber?: number): Promise<QueueManipulationResult>
```

```ts
await reorderQueue(4, 1); // make item 4 play next
```

## swapQueueItems

```ts signature
swapQueueItems(slotA: number, slotB: number, channelNumber?: number): Promise<QueueManipulationResult>
```

```ts
await swapQueueItems(1, 3);
```

## shuffleQueue

```ts signature
shuffleQueue(channelNumber?: number, random?: () => number): Promise<QueueManipulationResult>
```

Shuffles the waiting items; the current item keeps playing. Pass your own random function for a
reproducible order (for example a seeded generator in tests).

```ts
await shuffleQueue(0);
```

## clearQueueAfterCurrent

```ts signature
clearQueueAfterCurrent(channelNumber?: number): Promise<QueueManipulationResult>
```

Lets the current item finish and drops everything after it.

## Reading the queue

```ts signature
getQueueLength(channelNumber?: number): number
getQueueItemInfo(queueSlotNumber: number, channelNumber?: number): QueueItem | null
getQueueSnapshot(channelNumber?: number): QueueSnapshot | null
```

```ts
console.log(getQueueLength(0));
const next = getQueueItemInfo(1, 0);
console.log(next?.fileName, next?.metadata?.title, next?.duration);
const snapshot = getQueueSnapshot(0); // null for a channel never used
console.log(snapshot?.items.map((item) => item.id), snapshot?.isPaused);
```

`QueueItem.duration` is 0 until the file's metadata has loaded (only the current and next items
are preloaded).

## Reacting to changes

```ts
const off = onQueueChange(0, (snapshot) => {
  console.log(`${snapshot.totalItems} items, current index ${snapshot.currentIndex}`);
});
off();
```
