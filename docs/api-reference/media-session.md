---
sidebar_position: 11
title: Lock Screen and Media Keys
description: Show the current item on lock screens and control it from media keys
---

# Lock Screen and Media Keys

```ts signature
connectMediaSession(options?: MediaSessionOptions): Unsubscribe
```

Shows a channel's current item on the lock screen, in media notifications and in the browser's
media hub, using the Media Session API, and makes their buttons control the channel. It returns a
function that disconnects again. Where the API is not available it does nothing.

```ts
const disconnect = connectMediaSession({ channel: 0, seekOffsetMs: 15000 });

await queueAudio('/episodes/42.mp3', 0, {
  metadata: {
    album: 'Season 2',
    artist: 'My Podcast',
    artwork: [{ sizes: '512x512', src: '/art/42.png', type: 'image/png' }],
    title: 'Episode 42'
  }
});

disconnect(); // when the player goes away
```

| Option         | Default       | Description                                                   |
| -------------- | ------------- | ------------------------------------------------------------- |
| `channel`      | `0`           | Channel shown and controlled.                                 |
| `queue`        | default queue | A queue made with `createAudioQueue()`.                       |
| `seekOffsetMs` | `10000`       | Skip length for the back/forward buttons when the OS gives none. |

## What it does

- **Metadata**: title, artist, album and artwork from the item's `metadata` (the file name is the
  fallback title).
- **State**: playing or paused follows the channel; the position bar follows playback.
- **Buttons**: play, pause, stop, next (skips to the next item), previous (back to the start),
  seek backward/forward, and scrubbing.
- When the queue runs out, the lock-screen entry is cleared.

`connectMediaSession` is a separate function, so apps that do not use it do not ship it.
