---
sidebar_position: 5
title: Browser Compatibility
description: Supported browsers and platform notes
---

# Browser Compatibility

AudioQ supports browsers from 2020 onwards (it is compiled to ES2020):

| Browser          | Minimum version |
| ---------------- | --------------- |
| Chrome, Edge     | 80              |
| Firefox          | 74              |
| Safari (macOS)   | 13.1            |
| Safari (iOS)     | 13.4            |
| Samsung Internet | 13              |

Node.js can import AudioQ (for server-side rendering) but cannot play audio; `queueAudio` explains
this with an error if called on the server.

## Autoplay rules

Every modern browser blocks audio until the user has interacted with the page. AudioQ handles
this for you:

- The blocked item stays queued and an `AutoplayBlocked` error is reported once.
- Playback starts on the next click, tap or key press (the events that grant permission).
- `unlockAudio()` does the same from your own handler.

## iOS and iPadOS

- **Volume:** iOS ignores `HTMLAudioElement.volume`. AudioQ routes same-origin audio through the
  Web Audio API on iOS so volume, fades, ducking and crossfades work. Cross-origin files need
  `crossOrigin: 'anonymous'` and CORS headers for this; without them they play at full volume
  (never silently). See [iOS and Web Audio](../api-reference/configuration#ios-and-web-audio).
- **Interruptions:** phone calls, Siri and Control Center pause audio. AudioQ notices, reports the
  channel as paused, and fires `onAudioPause`; playing from the lock screen fires `onAudioResume`.
- **Capacitor and Ionic apps** (`capacitor://` pages) get Web Audio volume control too.

## Android

- Chrome may delay loading media in background tabs. If items time out there, raise
  `loadTimeoutMs` or use `pauseWhenHidden`.
- Unplugging headphones pauses audio; AudioQ reports it like any other OS pause.

## Formats

AudioQ plays whatever the browser's `<audio>` element plays. MP3 and AAC (M4A) work everywhere;
Opus/WebM and Ogg Vorbis work everywhere except some older Safari versions; WAV works everywhere
but is large.
