---
sidebar_position: 7
title: Volume Ducking
description: Lower other channels while a priority channel has audio
---

# Volume Ducking

Ducking lowers every other channel while a **priority channel** (usually voice) has audio queued,
and restores them when it is empty.

```ts signature
setVolumeDucking(config: VolumeConfig): void
clearVolumeDucking(): void
```

```ts
setVolumeDucking({
  duckingVolume: 0.2, // other channels drop to 20%
  duckTransitionDuration: 200,
  priorityChannel: 2,
  priorityVolume: 1, // multiplier for the priority channel itself
  restoreTransitionDuration: 600,
  transitionEasing: EasingType.EaseOut
});

await queueAudio('/music/theme.mp3', 0, { loop: true });
await queueAudio('/voice/announcement.mp3', 2); // music ducks while this plays
clearVolumeDucking();
```

| Option                      | Default    | Description                                       |
| --------------------------- | ---------- | ------------------------------------------------- |
| `priorityChannel`           | (required) | Channel whose audio triggers ducking.             |
| `duckingVolume`             | (required) | Multiplier (0-1) for every other channel.         |
| `priorityVolume`            | (required) | Multiplier (0-1) for the priority channel.        |
| `duckTransitionDuration`    | 250        | Milliseconds to duck.                             |
| `restoreTransitionDuration` | 250        | Milliseconds to restore.                          |
| `transitionEasing`          | ease-out   | Curve for both transitions.                       |

Ducking is a separate factor in the volume, so channel volumes are untouched and come back
exactly. Channels that start playing while ducking is active are ducked too, and the priority
sound starts immediately (it never waits for the duck to finish).
