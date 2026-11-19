---
sidebar_position: 6
title: Volume
description: Channel, item and global volume, and volume transitions
---

# Volume

The volume you hear is the product of independent parts, so changing one never overwrites
another:

**channel volume × item volume × global volume × ducking × fade**

```ts
await setChannelVolume(0, 0.8); // channel
await queueAudio('/sfx/quiet.mp3', 0, { volume: 0.5 }); // item: plays at 0.4
await setGlobalVolume(0.5); // master: now 0.2
console.log(getCurrentAudioInfo(0)?.volume); // 0.2, the effective output volume
```

## Channel volume

```ts signature
setChannelVolume(channelNumber: number, volume: number, transitionDuration?: number, easing?: EasingType): Promise<void>
getChannelVolume(channelNumber?: number): number
getAllChannelsVolume(): number[]
setAllChannelsVolume(volume: number): Promise<void>
```

Volumes are clamped to 0-1; `NaN` leaves the volume unchanged. Setting a volume works on idle
channels too and applies to what plays next.

```ts
await setChannelVolume(1, 0.3);
await setChannelVolume(1, 1, 500, EasingType.EaseIn); // over 500 ms
await setAllChannelsVolume(0.7);
console.log(getAllChannelsVolume()); // one entry per channel up to the highest used
```

## Transitions

```ts signature
transitionVolume(channelNumber: number, targetVolume: number, duration?: number, easing?: EasingType): Promise<void>
cancelVolumeTransition(channelNumber: number): void
cancelAllVolumeTransitions(): void
```

`transitionVolume` is `setChannelVolume` with a duration (default 250 ms). A new transition
replaces a running one; cancelling stops it where it is.

```ts
void transitionVolume(0, 0, 3000, EasingType.Linear); // slow fade to silence
cancelVolumeTransition(0); // stop halfway
```

Easing types: `EasingType.Linear`, `EaseIn`, `EaseOut` (default), `EaseInOut`.

## Global volume

```ts signature
setGlobalVolume(volume: number): Promise<void>
getGlobalVolume(): number
```

A master volume that multiplies every channel. `destroyAllChannels()` resets it to 1.

## Muting

```ts signature
setMuted(muted: boolean): void
isMuted(): boolean
setChannelMuted(channelNumber: number, muted: boolean): void
isChannelMuted(channelNumber?: number): boolean
```

Muting keeps every volume, so unmuting restores the mix exactly. Audio keeps playing while muted
(use pausing to stop it). Muting is instant; a crossfade's fading tail goes silent too.

```ts
setMuted(!isMuted()); // a mute button for everything
setChannelMuted(0, true); // just the music
console.log(isChannelMuted(0), getChannelVolume(0)); // true, and the volume is unchanged
```

`getCurrentAudioInfo().volume` reports 0 while muted. `destroyAllChannels()` unmutes.

## Stereo panning

```ts signature
setChannelPan(channelNumber: number, pan: number): void
getChannelPan(channelNumber?: number): number
```

Places a channel from -1 (left) through 0 (center) to 1 (right), for example footsteps or a
character speaking from one side. Values outside are clamped; `NaN` throws a `RangeError`.

```ts
setChannelPan(1, -0.8);
await queueAudio('/sfx/footsteps.mp3', 1);
setChannelPan(1, 0.8); // moves while playing
```

Panning routes the channel through the Web Audio API, so it works for same-origin audio,
[preloaded](preloading) files, and CORS audio queued with `crossOrigin: 'anonymous'`. Other
audio plays centered and a warning is logged. It is ignored when `webAudio` is `'off'` and in
browsers without `StereoPannerNode` (Safari before 14.1).

## iOS

iOS ignores the audio element's volume. AudioQ routes same-origin audio through the Web Audio API
there so all of the above works; see [iOS and Web Audio](configuration#ios-and-web-audio).
