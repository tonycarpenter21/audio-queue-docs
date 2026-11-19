---
sidebar_position: 0
title: Quick Reference
description: Every AudioQ function on one page
---

# Quick Reference

Every top-level function is also a method on queues made with `createAudioQueue()`. Channel
arguments default to 0 where shown with `?`.

## Queueing

| Function                                       | Does                                              |
| ---------------------------------------------- | ------------------------------------------------- |
| `queueAudio(source, channel?, options?)`       | Add audio; plays now if the channel is idle       |
| `queueAudioPriority(source, channel?, options?)` | Add right after the current item               |
| `stopCurrentAudioInChannel(channel?)`          | Skip to the next item                             |
| `stopAllAudioInChannel(channel?)`              | Stop and clear a channel                          |
| `stopAllAudio()`                               | Stop and clear every channel                      |
| `destroyChannel(channel?)`                     | Stop a channel and forget its settings/listeners |
| `destroyAllChannels()`                         | Reset the whole queue                             |

## Rearranging

| Function                                  | Does                                  |
| ----------------------------------------- | ------------------------------------- |
| `removeQueuedItem(slot, channel?)`        | Remove a waiting item                 |
| `reorderQueue(from, to, channel?)`        | Move a waiting item                   |
| `swapQueueItems(a, b, channel?)`          | Swap two waiting items                |
| `shuffleQueue(channel?, random?)`         | Shuffle waiting items                 |
| `clearQueueAfterCurrent(channel?)`        | Drop everything after the current item |
| `getQueueLength(channel?)`                | Items on a channel                    |
| `getQueueItemInfo(slot, channel?)`        | One item's details                    |
| `getQueueSnapshot(channel?)`              | The whole queue                       |

## Playback

| Function                                   | Does                                        |
| ------------------------------------------ | ------------------------------------------- |
| `pauseChannel` / `resumeChannel` / `togglePauseChannel` (channel?) | Pause control |
| `pauseAllChannels` / `resumeAllChannels` / `togglePauseAllChannels`() | All channels |
| `pauseWithFade(fade?, channel?, ms?)` / `resumeWithFade(...)` / `togglePauseWithFade(...)` | With fades |
| `pauseAllWithFade` / `resumeAllWithFade` / `togglePauseAllWithFade`(fade?, ms?) | All, with fades |
| `seekTo(channel, ms)` / `seekBy(channel, ms)` | Jump to / skip by a position             |
| `setPlaybackRate(channel, rate)` / `getPlaybackRate(channel?)` | Speed (0.25-4)         |
| `setRepeatMode(channel, mode)` / `getRepeatMode(channel?)` | `'off' \| 'one' \| 'all'` |
| `setChannelGap(channel, ms)` / `getChannelGap(channel?)` | Silence between items       |
| `setCrossfade(channel, ms)` / `getCrossfade(channel?)` | Overlap between items         |
| `getHistory(channel?)` / `clearHistory(channel?)` | Finished items                      |
| `unlockAudio()`                            | Start blocked audio from your own handler   |
| `isChannelPaused(channel?)` / `getAllChannelsPauseState()` | Pause state                 |

## Volume

| Function                                               | Does                         |
| ------------------------------------------------------ | ---------------------------- |
| `setChannelVolume(channel, volume, ms?, easing?)`      | Channel volume               |
| `transitionVolume(channel, volume, ms?, easing?)`      | Channel volume over time     |
| `cancelVolumeTransition(channel)` / `cancelAllVolumeTransitions()` | Stop a transition |
| `getChannelVolume(channel?)` / `getAllChannelsVolume()` | Read volumes                |
| `setAllChannelsVolume(volume)`                         | Every channel                |
| `setGlobalVolume(volume)` / `getGlobalVolume()`        | Master volume                |
| `setMuted(muted)` / `isMuted()`                        | Mute everything              |
| `setChannelMuted(channel, muted)` / `isChannelMuted(channel?)` | Mute one channel     |
| `setVolumeDucking(config)` / `clearVolumeDucking()`    | Duck under a priority channel |

## Events

`onAudioStart`, `onAudioComplete`, `onAudioProgress`, `onAudioPause`, `onAudioResume`,
`onQueueChange`, `onAudioError`, `onAudioCue` (each `(channel, callback)` and returning an
unsubscribe function), and the matching `off*` functions `(channel?, callback?)`.

## Information and configuration

| Function                                   | Does                                      |
| ------------------------------------------ | ----------------------------------------- |
| `getCurrentAudioInfo(channel?)`            | Current item's playback state             |
| `getAllChannelsInfo()`                     | The same for every channel                |
| `setQueueConfig(config)` / `getQueueConfig()` | Configuration                          |
| `setChannelQueueLimit(channel, size?)`     | Per-channel limit                         |
| `getWebAudioSupport()`                     | Whether Web Audio routing is used          |
| `createAudioQueue(config?)`                | An independent queue                      |
| `getDefaultAudioQueue()`                   | The queue behind the top-level functions  |

## Helpers (tree-shakable)

| Function                                   | Does                                      |
| ------------------------------------------ | ----------------------------------------- |
| `defineSprite(src, map, queue?)`           | Named segments of one file                |
| `parseWebVtt(text)` / `parseVttTimestamp(t)` | Captions to cues                        |
| `connectMediaSession(options?)`            | Lock-screen and media-key controls        |
| `preloadAudio(urls, queue?)` / `isAudioPreloaded(url)` / `releasePreloadedAudio(urls?)` | Keep files in memory ([Preloading](preloading)) |
| `createChannelStore(channel?, queue?)`     | Channel state for React, Svelte, Vue      |
| `extractFileName(url)`                     | Readable file name from a URL             |
| `getFadeConfig(fadeType)`                  | A fade preset's settings                  |
| `isIOSDevice()` / `isWebAudioSupported()`  | Platform checks                           |
