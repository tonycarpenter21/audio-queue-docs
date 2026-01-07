---
title: Basic Usage Examples
description: Practical examples showing how to use audio-channel-queue in real applications
sidebar_position: 1
---

# Basic Usage Examples

Welcome to the practical examples section! Here you'll find real-world implementations showing how to use `audio-channel-queue` in your applications.

## Interactive Demo

The best way to understand the library is to try our **interactive demo**:

**[Live Demo](https://tonycarpenter21.github.io/audio-queue-demo/)** 

This demo includes:
- **Queue Management** - Add, remove, and prioritize audio
- **Pause & Resume** - With smooth fade effects  
- **Volume Control** - Per-channel and global volume
- **Real-time Progress** - Visual feedback and progress tracking

## Quick Start Example

Here's a minimal example to get you started:

```typescript
import { queueAudio, pauseChannel, resumeChannel, setChannelVolume } from 'audio-channel-queue';

// Queue some audio files
await queueAudio('sounds/background-music.mp3', 0);
await queueAudio('sounds/sound-effect.mp3', 1);

// Control playback
await pauseChannel(0);     // Pause background music
await resumeChannel(0);    // Resume background music

// Adjust volumes
await setChannelVolume(0, 0.5);  // 50% volume for channel 0
await setChannelVolume(1, 0.8);  // 80% volume for channel 1
```

## Common Use Cases

### Game Audio System
```typescript
// Background music on channel 0
await queueAudio('music/level1-theme.mp3', 0, { loop: true });

// Sound effects on channel 1
await queueAudio('sounds/jump.mp3', 1);
await queueAudio('sounds/collect-coin.mp3', 1);

// UI sounds on channel 2
await queueAudio('sounds/button-click.mp3', 2);
```

### Web Application
```typescript
// Notification sounds
await queueAudio('notifications/message.mp3', 0);
await queueAudio('notifications/alert.mp3', 0);

// Background ambiance
await queueAudio('ambient/office-sounds.mp3', 1, { 
  loop: true,
  volume: 0.3 
});
```

### Interactive Media Player
```typescript
// Main audio content
await queueAudio('audio/main-content.mp3', 0);

// Pause with smooth fade
await transitionVolume(0, 0, 1000);
await pauseChannel(0);

// Resume with fade-in
await resumeChannel(0);
await transitionVolume(0, 1, 1000);
```

## Try the Live Examples

Ready to see these concepts in action? 

**[Explore Interactive Examples](https://tonycarpenter21.github.io/audio-queue-demo/)**

The live demo includes all the code examples above plus advanced features like:
- Multiple fade curve types (linear, ease-in, ease-out, ease-in-out)
- Real-time volume control with visual feedback
- Multi-channel audio management
- Progress tracking and visualization

## Next Steps

- **[API Reference](../api-reference/queue-management)** - Complete function documentation
- **[Core Concepts](../core-concepts/audio-channels)** - Understanding channels and queues
- **[Advanced Features](../api-reference/volume-ducking)** - Power user techniques

## Need Help?

Having trouble? Check out our:
- **[Troubleshooting Guide](../migration/troubleshooting)**
- **[Browser Compatibility](../getting-started/browser-compatibility)**
- **[GitHub Issues](https://github.com/tonycarpenter21/audio-channel-queue/issues)** 