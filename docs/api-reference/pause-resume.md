---
sidebar_position: 5
title: Pause and Resume
description: Pausing channels, fades, toggles, and pauses that come from the operating system
---

# Pause and Resume

## Channels

```ts signature
pauseChannel(channelNumber?: number): Promise<void>
resumeChannel(channelNumber?: number): Promise<void>
togglePauseChannel(channelNumber?: number): Promise<void>
isChannelPaused(channelNumber?: number): boolean
```

```ts
await pauseChannel(0);
console.log(isChannelPaused(0)); // true
await resumeChannel(0);
await togglePauseChannel(0);
```

`resumeChannel` resolves once the browser accepted or refused playback (at most `loadTimeoutMs`).
Items that finish or fail while a channel is paused leave the next item waiting, paused.

## Every channel

```ts signature
pauseAllChannels(): Promise<void>
resumeAllChannels(): Promise<void>
togglePauseAllChannels(): Promise<void>
getAllChannelsPauseState(): boolean[]
```

`togglePauseAllChannels` pauses everything if anything is playing, and resumes everything
otherwise.

## Fades

```ts signature
pauseWithFade(fadeType?: FadeType, channelNumber?: number, duration?: number): Promise<void>
resumeWithFade(fadeType?: FadeType, channelNumber?: number, duration?: number): Promise<void>
togglePauseWithFade(fadeType?: FadeType, channelNumber?: number, duration?: number): Promise<void>
pauseAllWithFade(fadeType?: FadeType, duration?: number): Promise<void>
resumeAllWithFade(fadeType?: FadeType, duration?: number): Promise<void>
togglePauseAllWithFade(fadeType?: FadeType, duration?: number): Promise<void>
```

| `FadeType` | Fade out (pause) | Fade in (resume) | Default length |
| ---------- | ---------------- | ---------------- | -------------- |
| `Gentle`   | ease-out         | ease-in          | 800 ms         |
| `Dramatic` | ease-in          | ease-out         | 800 ms         |
| `Linear`   | linear           | linear           | 800 ms         |

```ts
await pauseWithFade(FadeType.Gentle, 0); // fade out over 800 ms, then pause
await resumeWithFade(); // fades back in with the matching curve and length
await pauseWithFade(FadeType.Dramatic, 1, 2000); // custom length
console.log(getFadeConfig(FadeType.Gentle));
```

`resumeWithFade` reuses the fade type and length of the pause unless you pass others. Resuming
(or toggling) while a fade-out is still running cancels the pause and fades back in, so rapid
clicks never leave audio stuck. Fades are timer-based and finish in background tabs.

## Pausing while the page is hidden

```ts
setQueueConfig({ pauseWhenHidden: true });
```

Playing channels pause when the tab is hidden or the phone is locked, and resume when the page is
visible again. Channels you paused yourself stay paused.

## Pauses from the operating system

Phone calls, Siri, unplugged headphones, Control Center and media keys can pause audio without
your code knowing. AudioQ watches for this: the channel reports as paused and `onAudioPause`
fires; playing from the lock screen fires `onAudioResume`. To show the current item there, use
[`connectMediaSession`](media-session).
