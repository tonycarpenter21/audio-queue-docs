---
sidebar_position: 1
title: Queue Management
description: Functions for managing audio queues - queueAudio, queueAudioPriority, and stop functions
---

# 🎵 Queue Management Functions

This section covers all functions related to managing audio queues - adding audio, priority queuing, and stopping playback.

## queueAudio()

Add an audio file to the end of a queue and start playing it automatically.

### Syntax

```typescript
queueAudio(audioFile: string, channelNumber?: number, options?: AudioOptions): Promise<void>
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `audioFile` | `string` | **Required** | Path or URL to the audio file |
| `channelNumber` | `number` | `0` | Channel number (0, 1, 2, etc.) |
| `options` | `AudioOptions` | `{}` | Configuration options |

### AudioOptions

```typescript
interface AudioOptions {
  loop?: boolean;     // Loop the audio when it finishes
  volume?: number;    // Initial volume (0-1 range)
  priority?: boolean; // Same as queueAudioPriority if true
}
```

### Examples

**Basic Usage**
```typescript
import { queueAudio } from 'audio-channel-queue';

// Play on default channel (0)
await queueAudio('./sounds/welcome.mp3');

// Play on specific channel
await queueAudio('./music/background.mp3', 1);
```

**With Options**
```typescript
// Background music with loop and volume
await queueAudio('./music/ambient.mp3', 0, {
  loop: true,
  volume: 0.3
});

// Sound effect at full volume
await queueAudio('./sfx/explosion.wav', 1, {
  volume: 1.0
});
```

**Multiple Files in Queue**
```typescript
// Queue multiple songs - they'll play in order
await queueAudio('./music/song1.mp3', 0);
await queueAudio('./music/song2.mp3', 0);
await queueAudio('./music/song3.mp3', 0);
```

### Return Value

Returns a `Promise<void>` that resolves when the audio has been successfully added to the queue.

---

## queueAudioPriority()

Add an audio file to the **front** of the queue (plays after current audio finishes). Perfect for urgent announcements!

### Syntax

```typescript
queueAudioPriority(audioFile: string, channelNumber?: number, options?: AudioOptions): Promise<void>
```

### Parameters

Same as `queueAudio()` - the only difference is queue position.

### Examples

**Urgent Announcements**
```typescript
// Queue some background music
await queueAudio('./music/song1.mp3', 0);
await queueAudio('./music/song2.mp3', 0);
await queueAudio('./music/song3.mp3', 0);

// Emergency announcement - plays immediately!
await queueAudioPriority('./voice/emergency.mp3', 0);
// Stop the current sound so the priority announcement plays near immediately
stopCurrentAudioInChannel(); // Note: defaults to channel 0

// The emergency message now plays right away instead of waiting
```

**Gaming Example**
```typescript
// Background music playing
await queueAudio('./music/level-theme.mp3', 0, { loop: true });

// Boss appears - urgent battle music needs to start now!
await queueAudioPriority('./music/boss-battle.mp3', 0);
stopCurrentAudioInChannel(); // Immediately stop level theme, start boss music

// Boss music plays instantly instead of waiting for level theme to finish
```

---

## stopCurrentAudioInChannel()

Stop the currently playing audio in a specific channel and automatically start the next queued item.

### Syntax

```typescript
stopCurrentAudioInChannel(channelNumber?: number): void
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `channelNumber` | `number` | `0` | Channel to stop current audio |

> **Note:** `channelNumber` is optional and defaults to `0`. Functions like `stopCurrentAudioInChannel()`, `stopAllAudioInChannel()`, and several others use channel 0 by default when no channel is specified.

### Examples

```typescript
import { stopCurrentAudioInChannel } from 'audio-channel-queue';

// Skip to next song on default channel (0)
stopCurrentAudioInChannel();

// Skip to next song on specific channel
stopCurrentAudioInChannel(1);

// Gaming example - immediate audio switching
function handleBossFight(): void {
  // Stop current background music and play boss theme
  stopCurrentAudioInChannel(); // Skip current song
  queueAudioPriority('./music/boss-theme.mp3');
}
```

### Real-world Usage

```typescript
class MusicPlayer {
  private currentChannel: number = 0;

  skipToNext(): void {
    console.log('Skipping to next track...');
    if (this.currentChannel === 0) {
      stopCurrentAudioInChannel(); // Use default for channel 0
    } else {
      stopCurrentAudioInChannel(this.currentChannel);
    }
  }

  skipToPrevious(): void {
    // In a real app, you'd track the previous song
    console.log('Going to previous track...');
    if (this.currentChannel === 0) {
      stopCurrentAudioInChannel();
    } else {
      stopCurrentAudioInChannel(this.currentChannel);
    }
    // Then queue the previous song with priority
  }

  emergencyStop(): void {
    // Stop whatever is playing immediately
    if (this.currentChannel === 0) {
      stopCurrentAudioInChannel();
    } else {
      stopCurrentAudioInChannel(this.currentChannel);
    }
  }
}
```

---

## stopAllAudioInChannel()

Stop the current audio and clear all queued items in a specific channel.

### Syntax

```typescript
stopAllAudioInChannel(channelNumber?: number): void
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `channelNumber` | `number` | `0` | Channel to clear completely |

### Examples

```typescript
// Queue multiple items
await queueAudio('./music/song1.mp3', 0);
await queueAudio('./music/song2.mp3', 0);
await queueAudio('./music/song3.mp3', 0);

// Stop everything on channel 0
stopAllAudioInChannel(0);

// Channel 0 is now silent and empty
```

**Emergency Stop Button**
```typescript
function createEmergencyStopButton() {
  const button = document.createElement('button');
  button.textContent = '🛑 Emergency Stop';
  button.onclick = () => {
    stopAllAudioInChannel(0); // Clear background music
    stopAllAudioInChannel(1); // Clear sound effects
  };
  return button;
}
```

---

## stopAllAudio()

Stop all audio across all channels. Nuclear option!

### Syntax

```typescript
stopAllAudio(): void
```

### Parameters

None.

### Examples

```typescript
// Start audio on multiple channels
await queueAudio('./music/background.mp3', 0);
await queueAudio('./sfx/ambient.wav', 1);
await queueAudio('./voice/narrator.mp3', 2);

// Stop everything everywhere
stopAllAudio();

// All channels are now silent
```

**Global Mute Implementation**
```typescript
let isMuted = false;

function toggleGlobalMute() {
  if (isMuted) {
    // Resume all channels
    resumeAllChannels();
    isMuted = false;
  } else {
    // Stop all audio
    stopAllAudio();
    isMuted = true;
  }
}
```

---

## 🎮 Real-World Usage Patterns

### Gaming Audio Manager

```typescript
class GameAudioManager {
  constructor() {
    // Set up channels
    // 0: Background music
    // 1: Sound effects
    // 2: Voice/announcements
  }

  async startLevel(levelNumber: number) {
    // Stop previous level music
    stopAllAudioInChannel(0);
    
    // Start new level music
    await queueAudio(`./music/level-${levelNumber}.mp3`, 0, {
      loop: true,
      volume: 0.4
    });
  }

  async playEffect(effectName: string) {
    await queueAudio(`./sfx/${effectName}.wav`, 1);
  }

  async playAnnouncement(message: string) {
    // Priority announcement that interrupts music briefly
    await queueAudioPriority(`./voice/${message}.mp3`, 0);
  }

  gameOver() {
    // Stop everything and play game over music
    stopAllAudio();
    queueAudio('./music/game-over.mp3', 0);
  }
}

// Usage
const audioManager = new GameAudioManager();
await audioManager.startLevel(1);
await audioManager.playEffect('jump');
await audioManager.playAnnouncement('checkpoint');
```

### Interactive Presentation

```typescript
class PresentationAudio {
  async startPresentation() {
    // Background ambient sound
    await queueAudio('./ambient/office.mp3', 1, {
      loop: true,
      volume: 0.1
    });
  }

  async playSlideNarration(slideNumber: number) {
    // Stop previous narration, start new one
    stopAllAudioInChannel(0);
    await queueAudio(`./narration/slide-${slideNumber}.mp3`, 0);
  }

  async playTransitionSound() {
    // Quick transition effect
    await queueAudio('./sfx/slide-transition.wav', 2);
  }

  endPresentation() {
    // Fade out and stop
    stopAllAudio();
  }
}
```

## 🔗 Related Functions

- **[Advanced Queue Manipulation](./advanced-queue-manipulation)** - Advanced queue editing, reordering, and item management
- **[Volume Control](./volume-control)** - Control playback volume
- **[Pause/Resume](./pause-resume)** - Pause and resume playback
- **[Event Listeners](./event-listeners)** - Monitor queue changes
- **[Audio Information](./audio-information)** - Get queue status

---

**Next:** Learn about **[Advanced Queue Manipulation](./advanced-queue-manipulation)** for precise queue control → 