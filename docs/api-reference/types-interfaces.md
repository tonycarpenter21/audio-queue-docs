---
sidebar_position: 15
title: Types
description: The TypeScript types AudioQ exports
---

# Types

Every type is exported from `'audioq'`:

```ts
import type { AudioInfo, AudioQueueOptions, QueuedAudio, QueueSnapshot } from 'audioq';
```

| Type                                  | Used for                                                     |
| ------------------------------------- | ------------------------------------------------------------ |
| `AudioSource`                         | `string` URL or `Blob`/`File` passed to `queueAudio`.        |
| `AudioQueueOptions`                   | Per-item options ([Queueing](queue-management#options)).     |
| `AudioMetadata`, `AudioArtwork`       | Your item data; artwork for lock screens.                    |
| `AudioCue`                            | A cue ([Cues](sprites-and-cues#cues)).                       |
| `QueuedAudio`                         | The handle `queueAudio` returns.                             |
| `ItemOutcome`, `CompletionReason`     | How an item finished.                                        |
| `AudioInfo`                           | Current item state ([Audio Information](audio-information)). |
| `QueueSnapshot`, `QueueItem`          | Queue state.                                                 |
| `QueueManipulationResult`             | Result of rearranging functions.                             |
| `HistoryEntry`                        | A finished item ([History](playback-controls#history)).      |
| `RepeatMode`                          | `'off' \| 'one' \| 'all'`.                                   |
| `AudioStartInfo`, `AudioCompleteInfo`, `AudioErrorInfo`, `AudioCueInfo` | Event payloads.    |
| `ProgressCallback`, `QueueChangeCallback`, `AudioStartCallback`, `AudioCompleteCallback`, `AudioPauseCallback`, `AudioResumeCallback`, `AudioErrorCallback`, `AudioCueCallback` | Listener types. |
| `Unsubscribe`                         | What `on*` functions return.                                 |
| `QueueConfig`, `Logger`, `WebAudioMode` | Configuration ([Configuration](configuration)).            |
| `VolumeConfig`                        | Ducking settings.                                            |
| `FadeConfig`                          | A fade preset.                                               |
| `WebAudioSupport`                     | Result of `getWebAudioSupport`.                              |
| `MediaSessionOptions`                 | Options for `connectMediaSession`.                           |
| `PreloadResult`                       | One result of `preloadAudio` ([Preloading](preloading)).     |
| `ChannelStore`, `ChannelState`, `ChannelStateListener` | `createChannelStore` ([React](../getting-started/react-integration)). |
| `AudioSprite`, `SpriteMap`, `SpriteSegment` | Sprites.                                               |
| `AudioQueue`                          | The opaque queue `createAudioQueue` returns.                 |

Optional fields accept an explicit `undefined`, so code compiled with
`exactOptionalPropertyTypes` can still write `{ maxQueueSize: undefined }`.

## Using the types

```ts
const options: AudioQueueOptions = { loop: true, metadata: { title: 'Theme' }, volume: 0.6 };
const item: QueuedAudio = await queueAudio('/music/theme.mp3', 0, options);
const describe = (info: AudioInfo): string => `${info.fileName} ${Math.round(info.progress * 100)}%`;
onAudioProgress(0, (info) => console.log(describe(info), item.id));
```
