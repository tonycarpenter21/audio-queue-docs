---
sidebar_position: 9
title: Audio Information
description: Reading the current item, the queue and every channel
---

# Audio Information

```ts signature
getCurrentAudioInfo(channelNumber?: number): AudioInfo | null
getAllChannelsInfo(): (AudioInfo | null)[]
getQueueSnapshot(channelNumber?: number): QueueSnapshot | null
```

## AudioInfo

The state of a channel's current item (also the payload of progress, pause and resume events).

| Field              | Type                         | Description                                               |
| ------------------ | ---------------------------- | --------------------------------------------------------- |
| `id`               | `number`                     | Item id (matches the handle and every event).             |
| `src`, `fileName`  | `string`                     | Source URL and readable name (plain text).                |
| `metadata`         | `AudioMetadata \| undefined` | What you passed when queueing.                            |
| `currentTime`      | `number`                     | Position in ms.                                           |
| `duration`         | `number`                     | Length in ms (0 while unknown, and for live streams).     |
| `progress`         | `number`                     | 0 to 1.                                                   |
| `isPlaying`        | `boolean`                    | Audio is coming out.                                      |
| `isPaused`         | `boolean`                    | The channel or element is paused.                         |
| `isLoading`        | `boolean`                    | Not enough data to play yet.                              |
| `isLooping`        | `boolean`                    | The item loops.                                           |
| `playbackRate`     | `number`                     | Effective speed (item × channel).                         |
| `volume`           | `number`                     | Effective output volume after every factor.               |
| `remainingInQueue` | `number`                     | Items waiting after this one.                             |

```ts
const info = getCurrentAudioInfo(0);
if (info) {
  const elapsed = Math.round(info.currentTime / 1000);
  console.log(`${info.metadata?.title ?? info.fileName}: ${elapsed}s`, info.isLoading ? '(loading)' : '');
}
```

## Every channel

`getAllChannelsInfo()` returns one entry per channel up to the highest channel used, with `null`
for channels with nothing queued.

```ts
getAllChannelsInfo().forEach((channelInfo, channel) => {
  if (channelInfo) console.log(channel, channelInfo.fileName);
});
```

## QueueSnapshot

| Field           | Type          | Description                                          |
| --------------- | ------------- | ---------------------------------------------------- |
| `channelNumber` | `number`      | The channel.                                         |
| `items`         | `QueueItem[]` | Items in play order; index 0 is current.             |
| `totalItems`    | `number`      | Number of items.                                     |
| `currentIndex`  | `number`      | 0 when there are items, -1 when the queue is empty.  |
| `isPaused`      | `boolean`     | Whether the channel is paused.                       |
| `volume`        | `number`      | Channel volume (before global volume, ducking, fade). |

Each `QueueItem` has `id`, `src`, `fileName`, `metadata`, `duration`, `volume`, `playbackRate`,
`isLooping` and `isCurrentlyPlaying`. `getQueueSnapshot` returns `null` for a channel that was
never used.
