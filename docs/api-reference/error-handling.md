---
sidebar_position: 10
title: Error Handling
description: What can fail, how it is reported, and how to retry
---

# Error Handling

## What happens when audio fails

- A failing **current** item is reported through `onAudioError` once and skipped; the next item
  plays. Its `finished` settles with `'error'`.
- A **waiting** item that fails while preloading is removed right away, without touching the item
  that is playing.
- An item that has not started within `loadTimeoutMs` (15 s by default) fails with `Timeout`.
- **Blocked autoplay is not a failure**: the item keeps its place, one `AutoplayBlocked` error is
  reported, and it plays on the next click, tap or key press.
- There are no automatic retries.

```ts signature
onAudioError(channelNumber: number, callback: AudioErrorCallback): Unsubscribe
offAudioError(channelNumber?: number, callback?: AudioErrorCallback): void
```

## AudioErrorType

| Type              | Meaning                                                         |
| ----------------- | --------------------------------------------------------------- |
| `AutoplayBlocked` | The browser needs a user interaction first. The item is kept.   |
| `Network`         | The file could not be downloaded.                               |
| `Decode`          | The file is corrupt or truncated.                               |
| `Unsupported`     | The browser cannot play this format or source.                  |
| `Timeout`         | Playback did not start within `loadTimeoutMs`.                  |
| `Abort`           | The browser aborted loading.                                    |
| `Unknown`         | Anything else.                                                  |

Types come from the browser's error codes and names, never from message text.

## Examples

Show a "tap to enable sound" hint:

```ts
onAudioError(0, (error) => {
  if (error.errorType === AudioErrorType.AutoplayBlocked) console.log('Tap anywhere to enable sound');
});
```

Retry network errors (re-queue the same source):

```ts
const attempts = new Map<string, number>();
onAudioError(0, (error) => {
  const tries = attempts.get(error.src) ?? 0;
  if (error.errorType === AudioErrorType.Network && tries < 3) {
    attempts.set(error.src, tries + 1);
    setTimeout(() => void queueAudio(error.src, error.channelNumber, { addToFront: true }), 1000);
  }
});
```

Fall back to another format:

```ts
onAudioError(0, (error) => {
  if (error.errorType === AudioErrorType.Unsupported && error.src.endsWith('.ogg')) {
    void queueAudio(error.src.replace(/\.ogg$/, '.mp3'), error.channelNumber, { addToFront: true });
  }
});
```

## Errors thrown by calls

| Call                       | Throws / rejects                                                  |
| -------------------------- | ----------------------------------------------------------------- |
| `queueAudio` with an empty source | `TypeError`                                                |
| Any invalid channel number | `RangeError`                                                      |
| Invalid options or config  | `RangeError` (for example `endAt` before `startAt`)               |
| Queue full                 | `Error` (unless `dropOldestWhenFull`)                             |
| `queueAudio` on a server   | `Error` explaining that a browser is needed                       |

Queue manipulation functions never throw; they return `{ success: false, error }`.
