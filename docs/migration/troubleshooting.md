---
sidebar_position: 2
title: Troubleshooting
description: Common problems and how to fix them
---

# Troubleshooting

## Nothing plays until I click

Browsers block sound until the user interacts with the page. AudioQ keeps what you queued and
starts it on the first click, tap or key press, and reports one `AutoplayBlocked` error so you
can show a hint. To start from your own button, call `unlockAudio()` in its handler.

```ts
onAudioError(0, (error) => {
  if (error.errorType === AudioErrorType.AutoplayBlocked) console.log('Tap to enable sound');
});
```

## A file is skipped

Listen for errors to see why:

```ts
onAudioError(0, (error) => console.warn(error.errorType, error.src, error.error.message));
```

- `Network`: check the path in the browser's network tab. Paths are relative to the page, not to
  your source file; with a bundler, import the file to get its final URL.
- `Unsupported`: the browser cannot play the format (for example Ogg on older Safari). MP3 and
  AAC/M4A play everywhere.
- `Timeout`: the file did not start within `loadTimeoutMs` (15 s). Raise it for slow networks or
  large files: `setQueueConfig({ loadTimeoutMs: 30000 })`.

## Sprites or `startAt` play from the beginning

Seeking needs the server to support HTTP Range requests. Most servers and CDNs do (GitHub Pages,
Netlify, Vercel, S3, nginx, Vite and webpack dev servers), but some simple ones do not, for
example `python -m http.server`. AudioQ retries the seek when playback starts and logs a warning
(`did not start at ... ms`), but the first moment may still be wrong. Serve the files from a
server with Range support.

## Volume, fades or ducking do nothing on iPhone

iOS ignores the audio element's volume, so AudioQ uses the Web Audio API there. That only works
for same-origin audio, or for audio served with CORS headers and queued with
`crossOrigin: 'anonymous'`. Otherwise the file plays at full volume. `getWebAudioSupport()` tells
you what is happening:

```ts
console.log(getWebAudioSupport().reason);
```

See [iOS and Web Audio](../api-reference/configuration#ios-and-web-audio).

## Audio stops when the phone locks or the tab is hidden

Mobile browsers may pause audio in the background, and calls or Siri interrupt it. AudioQ notices
and reports the channel as paused (`onAudioPause` fires). Use
[`connectMediaSession`](../api-reference/media-session) so users can resume from the lock screen.
If you want the opposite (stop sound in background tabs), set `pauseWhenHidden: true`.

## My queue grows forever

Set a limit, and drop the oldest waiting item instead of rejecting new ones if that suits you:

```ts
setQueueConfig({ defaultMaxQueueSize: 10, dropOldestWhenFull: true });
setChannelQueueLimit(3, 2); // a per-channel limit
```

Rapid repeats of the same sound can be collapsed with `dedupeMs`, and a new sound can replace the
current one with `interrupt: true`.

## Sounds linger after a component unmounts

Remove listeners and stop the channel in the cleanup. Both take effect immediately, so the cleanup
does not need to be async.

```ts
const off = onAudioStart(0, (info) => console.log(info.fileName));
// in the cleanup:
off();
void stopAllAudioInChannel(0);
```

See [React](../getting-started/react-integration) for complete hooks.

## Errors on the server (Next.js, Remix, Astro)

Importing AudioQ on the server is safe, but playing is not: call `queueAudio` from event handlers
or effects that run in the browser.

## Still stuck?

Open an issue at [github.com/tonycarpenter21/audioq](https://github.com/tonycarpenter21/audioq/issues)
with the browser, the device and a short example.
