# Audio Channels

Understanding the channel-based architecture that enables simultaneous audio playback and management.

## What Are Audio Channels?

Audio channels are independent playback streams that allow you to organize and control different types of audio content separately. Think of channels as separate "audio tracks" that can play simultaneously without interfering with each other.

```typescript
import { queueAudio, setChannelVolume } from 'audio-channel-queue';

// Channel 0: Background music (using default channel)
await queueAudio('./music/ambient.mp3');
setChannelVolume(0, 0.3);

// Channel 1: Sound effects
await queueAudio('./sfx/explosion.wav', 1);
setChannelVolume(1, 0.8);

// Channel 2: Voice/dialog
await queueAudio('./voice/character1.mp3', 2);
setChannelVolume(2, 1.0);
```

## Channel Architecture

### Independent Operation

Each channel operates completely independently:

- **Separate Queues**: Each channel maintains its own audio queue
- **Independent Volume**: Volume controls affect only the specific channel
- **Isolated Playback**: Pause/resume operations work per channel
- **Event Isolation**: Events are fired per channel

```typescript
import { 
  getCurrentAudioInfo, 
  pauseChannel, 
  resumeChannel,
  getQueueSnapshot 
} from 'audio-channel-queue';

// Check what's playing on each channel
const musicInfo = getCurrentAudioInfo();    // Background music (default channel 0)
const sfxInfo = getCurrentAudioInfo(1);      // Sound effects
const voiceInfo = getCurrentAudioInfo(2);    // Dialog

// Pause only the music channel
pauseChannel(0);

// Voice and SFX continue playing normally
console.log('Music paused, but voice and SFX still playing');

// Each channel has its own queue
const musicQueue = getQueueSnapshot();   // Default channel 0
const sfxQueue = getQueueSnapshot(1);
const voiceQueue = getQueueSnapshot(2);
```

### Channel Numbering

Channels are identified by zero-based integers:

```typescript
// Valid channel numbers
const channels = {
  MUSIC: 0,
  SFX: 1,
  VOICE: 2,
  AMBIENT: 3,
  UI_SOUNDS: 4
  // ... any number you need
};

// Use descriptive constants for better code organization
await queueAudio('./music/battle.mp3', channels.MUSIC);
await queueAudio('./voice/warning.mp3', channels.VOICE);
```

## Common Channel Patterns

### Gaming Applications

Typical channel organization for games:

```typescript
const GameChannels = {
  MUSIC: 0,           // Background music
  SFX: 1,             // Sound effects
  VOICE: 2,           // Character dialog
  AMBIENT: 3,         // Environmental sounds
  UI: 4              // Menu/UI sounds
} as const;

// Setup game audio
class GameAudioManager {
  async initializeAudio(): Promise<void> {
    // Background music - looped, lower volume (using default channel 0)
    await queueAudio('./music/game-theme.mp3', GameChannels.MUSIC, {
      loop: true,
      volume: 0.4
    });
    
    // Set channel volumes
    setChannelVolume(GameChannels.SFX, 0.8);
    setChannelVolume(GameChannels.VOICE, 1.0);
    setChannelVolume(GameChannels.AMBIENT, 0.3);
    setChannelVolume(GameChannels.UI, 0.6);
  }
  
  async playExplosion(): Promise<void> {
    // SFX don't loop, higher volume for impact
    await queueAudio('./sfx/explosion.wav', GameChannels.SFX);
  }
  
  async playDialog(audioFile: string): Promise<void> {
    // Dialog interrupts other voice
    // Priority playback places this right after the current playing sound in the queue
    await queueAudioPriority('./voice/' + audioFile, GameChannels.VOICE);
    // This stops the current playing sound so the new priority sound begins to play
    stopCurrentAudioInChannel();
  }
}
```

### Interactive Applications

Channel organization for interactive presentations or educational apps:

```typescript
const InteractiveChannels = {
  BACKGROUND: 0,      // Ambient background audio
  NARRATION: 1,       // Main narration/instruction
  FEEDBACK: 2,        // User interaction feedback
  ALERTS: 3          // Important alerts/warnings
} as const;

class InteractivePresentation {
  async startLesson(): Promise<void> {
    // Ambient background (using default channel 0)
    await queueAudio('./audio/classroom-ambient.mp3', InteractiveChannels.BACKGROUND, {
      loop: true,
      volume: 0.2
    });
    
    // Main narration
    await queueAudio('./audio/lesson-intro.mp3', InteractiveChannels.NARRATION);
  }
  
  async onUserClick(): Promise<void> {
    // Quick feedback sound
    await queueAudio('./audio/click-success.wav', InteractiveChannels.FEEDBACK, {
      volume: 0.5
    });
  }
  
  async showAlert(alertType: 'warning' | 'error' | 'success'): Promise<void> {
    // Alert interrupts narration but not background
    await queueAudioPriority(`./audio/alert-${alertType}.mp3`, InteractiveChannels.ALERTS);
  }
}
```

## Channel Management Best Practices

### Resource Management

```typescript
class ChannelManager {
  private activeChannels: Set<number> = new Set();
  
  async activateChannel(channel: number): Promise<void> {
    this.activeChannels.add(channel);
    console.log(`Channel ${channel} activated`);
  }
  
  async deactivateChannel(channel: number): Promise<void> {
    // Stop all audio on channel
    if (channel === 0) {
      // Use default for channel 0
      stopCurrentAudioInChannel();
    } else {
      stopCurrentAudioInChannel(channel);
    }
    
    // Clear queue
    const snapshot = channel === 0 ? getQueueSnapshot() : getQueueSnapshot(channel);
    if (snapshot.totalItems > 0) {
      console.log(`Clearing ${snapshot.totalItems} items from channel ${channel}`);
    }
    
    this.activeChannels.delete(channel);
  }
  
  getActiveChannels(): number[] {
    return Array.from(this.activeChannels);
  }
  
  async stopAllChannels(): Promise<void> {
    for (const channel of this.activeChannels) {
      await this.deactivateChannel(channel);
    }
  }
}
```

### Volume Balancing

```typescript
class VolumeManager {
  private channelVolumes: Map<number, number> = new Map();
  
  setBalancedVolumes(): void {
    // Gaming balance example
    this.setChannelVolume(0, 0.4);  // Music - subtle
    this.setChannelVolume(1, 0.8);  // SFX - prominent
    this.setChannelVolume(2, 1.0);  // Voice - full volume
    this.setChannelVolume(3, 0.3);  // Ambient - background
  }
  
  setChannelVolume(channel: number, volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setChannelVolume(channel, clampedVolume);
    this.channelVolumes.set(channel, clampedVolume);
  }
  
  duckChannels(exceptChannel: number, duckLevel: number = 0.3): void {
    // Use the proper ducking API instead of manual channel volume adjustments
    setVolumeDucking({
      priorityChannel: exceptChannel,
      priorityVolume: 1.0,
      duckingVolume: duckLevel
    });
  }
  
  restoreChannelVolumes(): void {
    // Restore original volumes
    for (const [channel, volume] of this.channelVolumes) {
      setChannelVolume(channel, volume);
    }
  }
}
```

### Event Coordination

```typescript
class ChannelEventCoordinator {
  setupCrossChannelEvents(): void {
    // When voice starts, duck other audio
    onAudioStart(2, (info) => {
      console.log('Voice started - ducking other channels');
      // Use the ducking API instead of individual channel adjustments
      setVolumeDucking({
        priorityChannel: 2,      // Voice channel
        priorityVolume: 1.0,     // Voice at full volume
        duckingVolume: 0.3       // Other channels at 30%
      });
    });
    
    // When voice ends, other channel volumes restore automatically
    
    // When music changes, log transition
    onAudioStart(0, (info) => {
      console.log(`Music changed to: ${info.fileName}`);
    });
    
    // Monitor queue changes across channels
    [0, 1, 2].forEach(channel => {
      onQueueChange(channel, (snapshot) => {
        if (snapshot.totalItems > 5) {
          console.warn(`Channel ${channel} queue is getting long: ${snapshot.totalItems} items`);
        }
      });
    });
  }
}
```

## Performance Considerations

### Optimal Channel Count

```typescript
// Recommended limits for different scenarios
const ChannelLimits = {
  MOBILE: 4,      // Conservative for mobile devices
  DESKTOP: 8,     // Good balance for desktop apps
  POWERFUL: 16    // For high-end applications
};

class PerformanceAwareChannelManager {
  private maxChannels: number;
  
  constructor(maxChannels: number = ChannelLimits.DESKTOP) {
    this.maxChannels = maxChannels;
  }
  
  canUseChannel(channel: number): boolean {
    if (channel >= this.maxChannels) {
      console.warn(`Channel ${channel} exceeds recommended limit of ${this.maxChannels}`);
      return false;
    }
    return true;
  }
  
  getRecommendedChannelCount(): number {
    // Detect environment and return appropriate limit
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? ChannelLimits.MOBILE : ChannelLimits.DESKTOP;
  }
}
```

### Memory Management

```typescript
class ChannelMemoryManager {
  async cleanupInactiveChannels(): Promise<void> {
    for (let channel = 0; channel < 10; channel++) {
      const snapshot = getQueueSnapshot(channel);
      const audioInfo = getCurrentAudioInfo(channel);
      
      // Clean up channels with no activity
      if (snapshot.totalItems === 0 && !audioInfo) {
        console.log(`Cleaning up inactive channel ${channel}`);
        // Channel cleanup is automatic, but good to track
      }
    }
  }
  
  getChannelMemoryUsage(): { [channel: number]: { queueSize: number; isActive: boolean } } {
    const usage: { [channel: number]: { queueSize: number; isActive: boolean } } = {};
    
    for (let channel = 0; channel < 10; channel++) {
      const snapshot = getQueueSnapshot(channel);
      usage[channel] = {
        queueSize: snapshot.totalItems,
        isActive: snapshot.totalItems > 0 && !snapshot.isPaused
      };
    }
    
    return usage;
  }
}
```

## Next Steps

Now that you understand audio channels, explore:

- **[Queue System](./queue-system.md)** - How queuing works within channels
- **[Event System](./event-system.md)** - Managing events across channels  
- **[Audio Lifecycle](./audio-lifecycle.md)** - Complete audio playback flow
- **[Performance & Memory](./performance-memory.md)** - Optimization strategies 