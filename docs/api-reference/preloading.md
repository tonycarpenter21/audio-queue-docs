---
sidebar_position: 12
title: Preloading
description: Download files into memory for instant, offline-capable playback
---

# Preloading

```ts signature
preloadAudio(sources: string | readonly string[], queue?: AudioQueue): Promise<PreloadResult[]>
isAudioPreloaded(source: string, queue?: AudioQueue): boolean
releasePreloadedAudio(sources?: string | readonly string[], queue?: AudioQueue): void
```

`preloadAudio` downloads files into memory. Items queued with a preloaded URL then play from
memory automatically, so they:

- start without a network delay (the first shot of a game sound, a quiz answer);
- keep working offline once loaded;
- seek reliably, even from servers without HTTP Range support, which matters for
  [sprites and `startAt`](sprites-and-cues);
- can use Web Audio on iOS when they come from a CORS-enabled CDN, so volume, fades and ducking
  work there.

```ts
const results = await preloadAudio(['/sfx/sprite.mp3', '/music/level-1.mp3']);
for (const result of results) {
  if (!result.ok) console.warn(`${result.src} will stream instead:`, result.error?.message);
}

await queueAudio('/sfx/sprite.mp3'); // plays from memory
console.log(isAudioPreloaded('/sfx/sprite.mp3')); // true
```

## Results

`preloadAudio` never rejects. Each `PreloadResult` has:

| Field   | Type                 | Description                                                  |
| ------- | -------------------- | ------------------------------------------------------------ |
| `src`   | `string`             | The resolved URL.                                            |
| `ok`    | `boolean`            | Whether the file is now in memory.                           |
| `bytes` | `number`             | Size in bytes (0 when it failed).                            |
| `error` | `Error \| undefined` | Network error, HTTP status, timeout or missing CORS headers. |

A file that failed still plays normally from the network. Calling `preloadAudio` again retries
it; calling it for a file that is loading or loaded does not download it twice.

## Freeing memory

```ts
releasePreloadedAudio('/music/level-1.mp3'); // one file
releasePreloadedAudio(['/a.mp3', '/b.mp3']); // several
releasePreloadedAudio(); // everything
```

Sounds that are already queued keep playing; later ones stream from the network again.
`destroyAllChannels()` also releases everything.

Preloaded files stay in memory until released, so preload what you will play soon (a level's
sounds, the next few tracks) rather than a whole library.

## Notes

- Files from another origin need CORS headers (`Access-Control-Allow-Origin`), because they are
  downloaded with `fetch`.
- Downloads give up after `loadTimeoutMs` (15 s by default; 0 means never).
- For a queue made with `createAudioQueue`, pass it as the last argument:
  `preloadAudio(urls, queue)`.
- Preloading is a separate module: apps that do not use it do not ship it.
