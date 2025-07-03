---
sidebar_position: 2
title: Quick Start
description: Get up and running with audio-channel-queue in 5 minutes
---

# 🚀 Quick Start Guide

Get up and running with Audio Channel Queue in just **5 minutes**! This guide will walk you through creating your first multi-channel audio application.

## 📋 What We'll Build

By the end of this guide, you'll have:
- ✅ Background music playing on channel 0
- ✅ Sound effects playing on channel 1
- ✅ Volume controls for each channel
- ✅ Pause/resume functionality
- ✅ Event listeners showing real-time feedback

## 🎵 Step 1: Basic Audio Playback

Let's start with the simplest possible example:

```typescript
import { queueAudio } from 'audio-channel-queue';

// Play a sound immediately
await queueAudio('./sounds/welcome.mp3');

console.log('Audio is now playing!');
```

That's it! Your first audio is playing. But let's make it more interesting...

## 🎛️ Step 2: Multiple Channels

Now let's use multiple channels to play different types of audio simultaneously:

```typescript
import { queueAudio, setChannelVolume } from 'audio-channel-queue';

// Background music on channel 0 (quieter)
await queueAudio('./music/background.mp3', 0, { 
  loop: true,    // Loop continuously
  volume: 0.3    // 30% volume
});

// Sound effects on channel 1 (louder)
await queueAudio('./sfx/button-click.wav', 1, {
  volume: 0.8    // 80% volume
});

console.log('Background music and sound effects playing!');
```

## ⏯️ Step 3: Add Pause/Resume Controls

Let's add some control over our audio:

```typescript
import { 
  queueAudio, 
  pauseChannel, 
  resumeChannel, 
  pauseAllChannels,
  resumeAllChannels
} from 'audio-channel-queue';

// Start some audio
await queueAudio('./music/background.mp3', 0, { loop: true });
await queueAudio('./sfx/explosion.wav', 1);

// Pause just the background music
await pauseChannel(0);
console.log('Background music paused');

// Resume it after 2 seconds
setTimeout(async () => {
  await resumeChannel(0);
  console.log('Background music resumed');
}, 2000);

// Emergency pause - stop everything!
// await pauseAllChannels();
```

## 🔊 Step 4: Volume Control

Control the volume of individual channels or all channels at once:

```typescript
import { setChannelVolume, setAllChannelsVolume, getChannelVolume } from 'audio-channel-queue';

// Set individual channel volumes
setChannelVolume(0, 0.2);  // Background music: 20%
setChannelVolume(1, 0.9);  // Sound effects: 90%

// Check current volume
const bgVolume = getChannelVolume(0);
console.log(`Background volume: ${bgVolume * 100}%`);

// Set all channels to the same volume
setAllChannelsVolume(0.5);  // All channels: 50%
```

## 📊 Step 5: Real-time Event Monitoring

Get real-time feedback about what's happening:

```typescript
import { 
  queueAudio,
  onAudioStart,
  onAudioComplete,
  onAudioProgress,
  onQueueChange
} from 'audio-channel-queue';

// Listen for when audio starts playing
onAudioStart(0, (info) => {
  console.log(`🎵 Started: ${info.fileName}`);
  console.log(`⏱️  Duration: ${(info.duration / 1000).toFixed(1)}s`);
});

// Listen for when audio finishes
onAudioComplete(0, (info) => {
  console.log(`✅ Completed: ${info.fileName}`);
  console.log(`📊 Remaining in queue: ${info.remainingInQueue}`);
});

// Listen for real-time progress updates
onAudioProgress(0, (info) => {
  const progressPercent = (info.progress * 100).toFixed(1);
  console.log(`📈 Progress: ${progressPercent}%`);
});

// Listen for queue changes
onQueueChange(0, (snapshot) => {
  console.log(`📋 Queue has ${snapshot.totalItems} items`);
});

// Now start some audio to see the events in action
await queueAudio('./music/song.mp3', 0);
```

## 🚨 Step 6: Priority Audio & Queue Management

Handle urgent audio that needs to play immediately:

```typescript
import { 
  queueAudio,
  queueAudioPriority,
  stopCurrentAudioInChannel,
  stopAllAudioInChannel
} from 'audio-channel-queue';

// Queue up some background music
await queueAudio('./music/song1.mp3', 0);
await queueAudio('./music/song2.mp3', 0);
await queueAudio('./music/song3.mp3', 0);

// Urgent announcement - play next!
await queueAudioPriority('./voice/important-announcement.mp3', 0);

// Stop current song and skip to next
stopCurrentAudioInChannel(0);

// Clear entire queue for emergency
// stopAllAudioInChannel(0);
```

## 🎮 Complete Example: Simple Game Audio

Here's a complete example showing how you might use Audio Channel Queue in a simple game:

```typescript
import { 
  queueAudio,
  queueAudioPriority,
  setChannelVolume,
  setVolumeDucking,
  pauseAllChannels,
  resumeAllChannels,
  onAudioStart
} from 'audio-channel-queue';

class GameAudio {
  constructor() {
    // Set up volume levels
    setChannelVolume(0, 0.4);  // Background music
    setChannelVolume(1, 0.8);  // Sound effects  
    setChannelVolume(2, 1.0);  // Voice/announcements

    // Set up volume ducking - when voice plays, reduce other audio
    setVolumeDucking({
      priorityChannel: 2,      // Voice channel
      priorityVolume: 1.0,     // Voice at full volume
      duckingVolume: 0.1       // Reduce others to 10%
    });

    // Log when important audio starts
    onAudioStart(2, (info) => {
      console.log(`🎙️ Voice announcement: ${info.fileName}`);
    });
  }

  async startGame() {
    // Start background music
    await queueAudio('./music/game-theme.mp3', 0, { loop: true });
    console.log('🎮 Game started!');
  }

  async playerJump() {
    // Quick sound effect
    await queueAudio('./sfx/jump.wav', 1);
  }

  async playerExplode() {
    // Explosion sound
    await queueAudio('./sfx/explosion.wav', 1);
  }

  async gameOver() {
    // Voice announcement on priority channel
    // This will automatically duck all other channels to 10% volume
    await queueAudio('./voice/game-over.mp3', 2);
    // When this audio finishes, other channels will return to their original volume
  }

  async pauseGame() {
    await pauseAllChannels();
    console.log('⏸️ Game paused');
  }

  async resumeGame() {
    await resumeAllChannels();
    console.log('▶️ Game resumed');
  }
}

// Use it in your game
const gameAudio = new GameAudio();

// Start the game
await gameAudio.startGame();

// Simulate some game events
setTimeout(() => gameAudio.playerJump(), 1000);
setTimeout(() => gameAudio.playerExplode(), 2000);
setTimeout(() => gameAudio.gameOver(), 3000);
```

## 🎯 What's Next?

Congratulations! You now have a solid foundation with Audio Channel Queue. Here's what to explore next:

### 📚 **[Core Concepts](../core-concepts/audio-channels)**
Understand how channels, queues, and the audio lifecycle work

### 📖 **[API Reference](../api-reference/queue-management)**  
Complete documentation of all available functions

### 🎯 **[Examples](../getting-started/basic-usage)**
Real-world examples for gaming and interactive apps

### 🔥 **[Advanced Features](../advanced/volume-ducking)**
Volume ducking, priority queuing, and progress tracking

## 💡 Quick Tips

**🎵 Audio File Tips:**
- Use MP3 for music and voice (good compression)
- Use WAV for short sound effects (no compression delay)
- Keep file sizes reasonable for web loading

**🎛️ Channel Organization:**
- Channel 0: Background music/ambient
- Channel 1: Sound effects/UI sounds  
- Channel 2: Voice/announcements
- Add more channels as needed

**⚡ Performance Tips:**
- Preload important audio files
- Use volume ducking instead of stopping/starting
- Monitor memory usage with many audio files

Ready to build something amazing? Check out our **[real-world examples](../getting-started/basic-usage)** for inspiration! 🚀 