---
sidebar_position: 13
title: Utilities and Constants
description: Small helpers and constants exported by AudioQ
---

# Utilities and Constants

```ts signature
extractFileName(url: string): string
getFadeConfig(fadeType: FadeType): FadeConfig
isIOSDevice(): boolean
isWebAudioSupported(): boolean
unlockAudio(): void
getWebAudioSupport(): WebAudioSupport
```

```ts
console.log(extractFileName('https://cdn.example.com/sfx/rock%20%26%20roll.mp3?v=2')); // 'rock & roll.mp3'
console.log(getFadeConfig(FadeType.Dramatic)); // { duration: 800, pauseCurve: 'ease-in', resumeCurve: 'ease-out' }
console.log(isIOSDevice(), isWebAudioSupported(), getWebAudioSupport().reason);
```

`extractFileName` returns plain text; escape it yourself only if you insert it with `innerHTML`.

`unlockAudio()` starts audio the browser blocked, from your own click or key handler. AudioQ also
does this automatically on the next pointer or key press.

## Constants

| Constant              | Value      | Meaning                                  |
| --------------------- | ---------- | ---------------------------------------- |
| `MAX_CHANNELS`        | `64`       | Default number of channels.              |
| `PLAYBACK_RATE_RANGE` | `[0.25, 4]` | Slowest and fastest playback speed.     |

## Enums

```ts
console.log(Object.values(AudioErrorType)); // 'abort', 'autoplay-blocked', 'decode', 'network', ...
console.log(Object.values(EasingType)); // 'linear', 'ease-in', 'ease-out', 'ease-in-out'
console.log(Object.values(FadeType)); // 'linear', 'gentle', 'dramatic'
```

See also [`defineSprite` and `parseWebVtt`](sprites-and-cues) and
[`connectMediaSession`](media-session).
