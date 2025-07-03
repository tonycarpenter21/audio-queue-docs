---
title: Volume Ducking
description: Advanced volume control and ducking techniques for audio-channel-queue
sidebar_position: 1
---

# Volume Ducking

Advanced volume control techniques for managing multiple audio channels with automatic volume ducking.

## What is Volume Ducking?

Volume ducking is a technique where the volume of background audio automatically reduces when priority audio (such as voice announcements) plays. This ensures important audio is clearly heard without manually adjusting volumes.

In audio-channel-queue, ducking works by:
1. Designating a priority channel
2. When audio plays on the priority channel, all other channels automatically reduce to a specified volume level
3. When the priority channel becomes inactive (no audio playing), all other channels return to their original volumes

## Setting Up Volume Ducking

### Basic Setup

```typescript
import { setVolumeDucking, queueAudio } from 'audio-channel-queue';

// Configure ducking
setVolumeDucking({
  priorityChannel: 2,      // Channel that triggers ducking
  priorityVolume: 1.0,     // Priority channel plays at 100% volume
  duckingVolume: 0.25      // All other channels reduce to 25% volume
});

// Start background music
await queueAudio('./music/background.mp3', 0, { loop: true });
await queueAudio('./sfx/ambient.mp3', 1);

// When voice plays, background music and ambient sounds will reduce to 25% volume
await queueAudio('./voice/announcement.mp3', 2);

// When the announcement finishes, other channels return to original volume
```

### Advanced Configuration

The `setVolumeDucking` function accepts several parameters for fine-tuning:

```typescript
setVolumeDucking({
  priorityChannel: 1,              // Channel that triggers ducking
  priorityVolume: 1.0,             // Priority channel volume (default: 1.0)
  duckingVolume: 0.2,              // Volume level for other channels during ducking
  duckTransitionDuration: 300,     // How quickly other channels duck (ms)
  restoreTransitionDuration: 800,  // How quickly other channels restore (ms)
  transitionEasing: 'ease-out'     // Easing function ('linear', 'ease-in', 'ease-out', 'ease-in-out')
});
```

### Disabling Ducking

To disable ducking, you can either:

```typescript
// Method 1: Clear all ducking settings
import { clearVolumeDucking } from 'audio-channel-queue';
clearVolumeDucking();

// Method 2: Set ducking volume to 1.0 (no reduction)
setVolumeDucking({
  priorityChannel: 1,
  duckingVolume: 1.0,
  priorityVolume: 1.0
});
```

## Practical Use Cases

### Game Audio System

```typescript
class GameAudioManager {
  constructor() {
    // Channels
    this.MUSIC_CHANNEL = 0;
    this.SFX_CHANNEL = 1;
    this.VOICE_CHANNEL = 2;
    this.UI_CHANNEL = 3;
    
    // Set up initial volumes
    setChannelVolume(this.MUSIC_CHANNEL, 0.6);
    setChannelVolume(this.SFX_CHANNEL, 0.8);
    setChannelVolume(this.VOICE_CHANNEL, 1.0);
    setChannelVolume(this.UI_CHANNEL, 0.7);
    
    // Configure voice to duck everything else
    this.setupVoiceDucking();
  }
  
  setupVoiceDucking() {
    setVolumeDucking({
      priorityChannel: this.VOICE_CHANNEL,
      priorityVolume: 1.0,
      duckingVolume: 0.15,
      duckTransitionDuration: 200,
      restoreTransitionDuration: 700
    });
  }
  
  playVoiceAnnouncement(file) {
    // Just queue normally - ducking happens automatically
    return queueAudio(file, this.VOICE_CHANNEL);
  }
}

const audioManager = new GameAudioManager();
await audioManager.playVoiceAnnouncement('./voice/mission-complete.mp3');
```

### Interactive Presentation

```typescript
class PresentationAudio {
  constructor() {
    // Set up ducking for narration
    setVolumeDucking({
      priorityChannel: 1,      // Narration channel
      priorityVolume: 1.0,     // Full volume narration
      duckingVolume: 0.1       // Background music very quiet
    });
    
    // Start ambient background music
    queueAudio('./music/ambient-background.mp3', 0, { loop: true });
  }
  
  async playNarration(trackName) {
    // Queue narration - will automatically duck background
    await queueAudio(trackName, 1);
    console.log('Narration complete, background music restored');
  }
  
  async playHighlightSound() {
    // Short sound effect - won't trigger ducking
    await queueAudio('./sfx/highlight.wav', 2);
  }
}
```

## Best Practices

1. **Choose appropriate ducking levels:**
   - Voice narration: 0.1-0.2 (heavy ducking)
   - Sound effects: 0.4-0.6 (moderate ducking)
   - UI sounds: 0.7-0.8 (light ducking)

2. **Use appropriate transition times:**
   - Fast duck (200-300ms) for immediate clarity
   - Slow restore (500-1000ms) for natural-sounding transitions

3. **Context-specific ducking:**
   - Different ducking settings for different game/app states
   - Clear ducking settings when changing scenes/contexts

## References

- **[API Reference](../api-reference/volume-control)** - Volume control functions
- **[Live Demo](https://tonycarpenter21.github.io/audio-queue-demo/)** - Interactive examples 