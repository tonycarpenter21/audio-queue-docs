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
await queueAudio(audioFile: string, channelNumber?: number = 0, options?: AudioQueueOptions): Promise<void>
```

### AudioQueueOptions

```typescript
interface AudioQueueOptions {
  addToFront?: boolean;   // Whether to add this audio to the front of the queue (after currently playing)
  loop?: boolean;         // Whether the audio should loop when it finishes
  maxQueueSize?: number;  // Maximum number of items allowed in the queue (defaults to unlimited) 
  priority?: boolean;     // TODO: @deprecated Use addToFront instead. Legacy support for priority queuing */
  volume?: number;        // Volume level for this specific audio (0-1)
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

// Best practice: handle errors for user-triggered audio
try {
  await queueAudio('./sounds/click.mp3');
} catch (error) {
  console.warn('Audio failed to load:', error);
}
```

**With Options**
```typescript
// Background music with loop and volume
await queueAudio('./music/ambient.mp3', 0, {
  loop: true,
  volume: 0.3  // Best practice: keep background music at 30-50% volume
});

// Sound effect at full volume
await queueAudio('./sfx/explosion.wav', 1, {
  volume: 1.0  // Best practice: keep SFX at 80-100% for impact
});

// Best practice: use consistent channel assignments
const CHANNELS = { BGM: 0, SFX: 1, VOICE: 2 };
await queueAudio('./music/theme.mp3', CHANNELS.BGM, { loop: true });
```

**Multiple Files in Queue**
```typescript
// Queue multiple songs - they'll play in order
await queueAudio('./music/song1.mp3', 0);
await queueAudio('./music/song2.mp3', 0);
await queueAudio('./music/song3.mp3', 0);

// Best practice: queue from array for dynamic playlists
const playlist = ['song1.mp3', 'song2.mp3', 'song3.mp3'];
for (const song of playlist) {
  await queueAudio(`./music/${song}`);
}
```
---

## queueAudioPriority()

Add an audio file to the **front** of the queue (plays after current audio finishes). Perfect for urgent announcements!

### Syntax

```typescript
await queueAudioPriority(audioFile: string, channelNumber?: number = 0, options?: AudioQueueOptions): Promise<void>
```

### Examples

**Urgent Announcements**
```typescript
// Queue some background music
await queueAudio('./music/song1.mp3');
await queueAudio('./music/song2.mp3');
await queueAudio('./music/song3.mp3');

// Emergency announcement - this queues immediately after the currently playing sound
await queueAudioPriority('./voice/emergency.mp3');
// Best practice: for immediate playback, stop current audio
await stopCurrentAudioInChannel(); // Skip current, play priority audio now

// Pro tip: combine with volume ducking for to quiet other channel sounds for smooth interruptions
setVolumeDucking({ priorityChannel: 1, duckingVolume: 0.1 });
await queueAudioPriority('./alerts/urgent.mp3', 1);
```

**Gaming Example**
```typescript
// Background music playing
await queueAudio('./music/level-theme.mp3', 0, { loop: true });

// Boss appears - urgent battle music needs to start now!
await queueAudioPriority('./music/boss-battle.mp3');
await stopCurrentAudioInChannel(); // Immediately stop level theme, start boss music

// Boss music plays instantly instead of waiting for level theme to finish
```

---

## stopCurrentAudioInChannel()

Stop the currently playing audio in a specific channel and automatically start the next queued item.

### Syntax

```typescript
await stopCurrentAudioInChannel(channelNumber?: number = 0): Promise<void>
```

### Examples

```typescript
import { stopCurrentAudioInChannel } from 'audio-channel-queue';

// Skip to next song on default channel (0)
await stopCurrentAudioInChannel();

// Skip to next song on specific channel
await stopCurrentAudioInChannel(1);

// Best practice: check if audio exists before stopping
if (getCurrentAudioInfo()) {
  await stopCurrentAudioInChannel();
} else {
  console.log('No audio playing to skip');
}

// Gaming example - immediate audio switching
function handleBossFight(): void {
  // Stop current background music and play boss theme
  await queueAudioPriority('./music/boss-theme.mp3');
  await stopCurrentAudioInChannel(); // Skip current song
}
```

---

## stopAllAudioInChannel()

Stop the current audio and clear all queued items in a specific channel.

### Syntax

```typescript
stopAllAudioInChannel(channelNumber?: number = 0): void
```


### Examples

```typescript
// Queue multiple items
await queueAudio('./music/song1.mp3');
await queueAudio('./music/song2.mp3');
await queueAudio('./music/song3.mp3');

// Stop everything on channel 0
stopAllAudioInChannel();

// Channel 0 is now silent and empty
```

**Emergency Stop Button**
```typescript
function createEmergencyStopButton() {
  const button = document.createElement('button');
  button.textContent = '🛑 Emergency Stop';
  button.onclick = () => {
    stopAllAudioInChannel(); // Clear background music (channel 0)
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
await stopAllAudio(): Promise<void>
```

### Examples

```typescript
// Start audio on multiple channels
await queueAudio('./music/background.mp3');
await queueAudio('./sfx/ambient.wav', 1);
await queueAudio('./voice/narrator.mp3', 2);

// Stop everything everywhere
await stopAllAudio();

// All channels are now silent
```

---

## destroyChannel()

Destroys a specific channel, clearing its queue and removing all event listeners.

### Syntax

```typescript
await destroyChannel(channelNumber: number = 0): Promise<void>
```

### Examples

```typescript
import { destroyChannel } from 'audio-channel-queue';

// Destroy a specific channel
await destroyChannel(0);
```
---

## destroyAllChannels()

Destroys all channels, clearing all queues and removing all event listeners.

### Syntax

```typescript
destroyAllChannels(): void
```

### Examples

```typescript
import { destroyAllChannels } from 'audio-channel-queue';

// Complete cleanup
destroyAllChannels();

// App shutdown cleanup
window.addEventListener('beforeunload', () => {
  await stopAllAudio();
  destroyAllChannels();
});
```
---

## setChannelQueueLimit()

Sets the maximum number of items allowed in a channel's queue.

### Syntax

```typescript
setChannelQueueLimit(channelNumber: number, maxSize?: number): void
```

### Examples

```typescript
import { setChannelQueueLimit } from 'audio-channel-queue';

// Limit channel 0 to 10 items
setChannelQueueLimit(0, 10);

// Remove limit for channel 0 (unlimited queue)
setChannelQueueLimit(0);

// Prevent queue overflow
setChannelQueueLimit(1, 5); // SFX channel 1 max 5 sounds
```

### Best Practice

```typescript
// Dynamic queue limits based on device
function setAdaptiveQueueLimits() {
  const isMobile = /mobile/i.test(navigator.userAgent);
  
  if (isMobile) {
    setChannelQueueLimit(0, 5);  // Smaller queues on mobile
    setChannelQueueLimit(1, 3);
  } else {
    setChannelQueueLimit(0, 20); // Larger queues on desktop
    setChannelQueueLimit(1, 10);
  }
}
```

---

## setQueueConfig() / getQueueConfig()

Global configuration for queue behavior across all channels.

### setQueueConfig()

```typescript
setQueueConfig(config: QueueConfig): void
```

### getQueueConfig()

```typescript
getQueueConfig(): QueueConfig
```

### QueueConfig Interface

```typescript
interface QueueConfig {
  defaultMaxQueueSize?: number; // Default maximum queue size across all channels (defaults to unlimited)
  dropOldestWhenFull?: boolean; // Whether to drop oldest items when queue is full (defaults to false - reject new items)
  showQueueWarnings?: boolean;  // Whether to show warnings when queue limits are reached (defaults to true)
}
```

### Examples

```typescript
import { setQueueConfig, getQueueConfig } from 'audio-channel-queue';

// Set global configuration
setQueueConfig({
  defaultMaxQueueSize: 10,
  dropOldestWhenFull: true,
  showQueueWarnings: true,
});

// Get current configuration
const config = getQueueConfig();
console.log(`Max queue size: ${config.defaultMaxQueueSize}`);

// Development vs production configs
const isDev = process.env.NODE_ENV === 'development';
setQueueConfig({
  showQueueWarnings: isDev,
  defaultMaxQueueSize: isDev ? 100 : 20
});
```

---

## Real-World Usage Patterns

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
    await queueAudioPriority(`./voice/${message}.mp3`);
  }

  gameOver() {
    // Stop everything and play game over music
    await stopAllAudio();
    await queueAudio('./music/game-over.mp3');
  }
}

// Usage
const audioManager = new GameAudioManager();
await audioManager.startLevel(1);
await audioManager.playEffect('jump');
await audioManager.playAnnouncement('checkpoint');
```

## 🔗 Related Functions

- **[Advanced Queue Manipulation](../advanced/advanced-queue-manipulation)** - Advanced queue editing, reordering, and item management
- **[Volume Control](./volume-control)** - Control playback volume
- **[Pause/Resume](./pause-resume)** - Pause and resume playback
- **[Event Listeners](./event-listeners)** - Monitor queue changes
- **[Audio Information](./audio-information)** - Get queue status

---

**Next:** Learn about **[Volume Control](./volume-control)** functions → 