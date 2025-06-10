# Volume Control

Control audio levels across individual channels or all channels simultaneously.

## setChannelVolume

Sets the volume for a specific audio channel.

### Syntax

```typescript
setChannelVolume(channelNumber: number, volume: number): void
```

### Parameters

- `channelNumber` (number): The channel number (0-based index)
- `volume` (number): Volume level between 0.0 (muted) and 1.0 (full volume)

### Examples

```typescript
import { setChannelVolume } from 'audio-channel-queue';

// Set channel 0 to half volume
setChannelVolume(0, 0.5);

// Mute channel 1
setChannelVolume(1, 0);

// Set channel 2 to full volume
setChannelVolume(2, 1.0);
```

### Real-world Usage

```typescript
class GameAudioManager {
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;

  updateMusicVolume(volume: number): void {
    this.musicVolume = volume;
    setChannelVolume(0, volume); // Music channel
  }

  updateSFXVolume(volume: number): void {
    this.sfxVolume = volume;
    setChannelVolume(1, volume); // SFX channel
  }

  muteAllAudio(): void {
    setChannelVolume(0, 0); // Mute music
    setChannelVolume(1, 0); // Mute SFX
  }

  restoreVolumes(): void {
    setChannelVolume(0, this.musicVolume);
    setChannelVolume(1, this.sfxVolume);
  }
}
```

## getChannelVolume

Retrieves the current volume level for a specific channel.

### Syntax

```typescript
getChannelVolume(channelNumber: number): number
```

### Parameters

- `channelNumber` (number): The channel number to query

### Returns

- `number`: Current volume level (0.0 to 1.0)

### Examples

```typescript
import { getChannelVolume, setChannelVolume } from 'audio-channel-queue';

// Set and then get volume
setChannelVolume(0, 0.75);
const currentVolume = getChannelVolume(0);
console.log(currentVolume); // 0.75

// Check if channel is muted
if (getChannelVolume(1) === 0) {
  console.log('Channel 1 is muted');
}
```

## setAllChannelsVolume

Sets the same volume level for all audio channels.

### Syntax

```typescript
setAllChannelsVolume(volume: number): void
```

### Parameters

- `volume` (number): Volume level between 0.0 and 1.0 to apply to all channels

### Examples

```typescript
import { setAllChannelsVolume } from 'audio-channel-queue';

// Set all channels to half volume
setAllChannelsVolume(0.5);

// Mute all channels
setAllChannelsVolume(0);

// Master volume control
function setMasterVolume(volume: number): void {
  // Clamp volume between 0 and 1
  const clampedVolume = Math.max(0, Math.min(1, volume));
  setAllChannelsVolume(clampedVolume);
}
```

## setVolumeDucking

Temporarily reduces volume on specified channels (ducking effect).

### Syntax

```typescript
setVolumeDucking(channelNumbers: number[], duckVolume: number): void
```

### Parameters

- `channelNumbers` (number[]): Array of channel numbers to duck
- `duckVolume` (number): Reduced volume level (0.0 to 1.0)

### Examples

```typescript
import { setVolumeDucking, clearVolumeDucking } from 'audio-channel-queue';

// Duck background music when dialog plays
function playDialog(): void {
  // Reduce music (channel 0) and ambient sounds (channel 2) to 20%
  setVolumeDucking([0, 2], 0.2);
  
  // Play dialog on channel 1
  queueAudio('/audio/dialog/important-message.mp3', 1);
}

// Restore original volumes when dialog ends
onAudioComplete(1, () => {
  clearVolumeDucking([0, 2]);
});
```

### Real-world Usage

```typescript
class PodcastPlayer {
  private readonly MUSIC_CHANNEL = 0;
  private readonly VOICE_CHANNEL = 1;
  private readonly ADS_CHANNEL = 2;

  playIntroMusic(): void {
    queueAudio('/audio/intro-music.mp3', this.MUSIC_CHANNEL);
  }

  startPodcast(): void {
    // Duck intro music when podcast starts
    setVolumeDucking([this.MUSIC_CHANNEL], 0.1);
    queueAudio('/audio/podcast-episode.mp3', this.VOICE_CHANNEL);
  }

  playAd(): void {
    // Duck both music and podcast for ad
    setVolumeDucking([this.MUSIC_CHANNEL, this.VOICE_CHANNEL], 0.05);
    queueAudio('/audio/advertisement.mp3', this.ADS_CHANNEL);
  }

  restoreNormalVolumes(): void {
    clearVolumeDucking([this.MUSIC_CHANNEL, this.VOICE_CHANNEL]);
  }
}
```

## clearVolumeDucking

Restores original volume levels for channels that were ducked.

### Syntax

```typescript
clearVolumeDucking(channelNumbers: number[]): void
```

### Parameters

- `channelNumbers` (number[]): Array of channel numbers to restore

### Examples

```typescript
import { setVolumeDucking, clearVolumeDucking } from 'audio-channel-queue';

// Temporary volume reduction for notification
function playNotification(): void {
  setVolumeDucking([0, 1], 0.3); // Duck channels 0 and 1
  
  setTimeout(() => {
    clearVolumeDucking([0, 1]); // Restore after 2 seconds
  }, 2000);
}
```

## Volume Best Practices

### 1. Volume Curves

Use logarithmic scaling for more natural volume perception:

```typescript
function linearToLogarithmic(linear: number): number {
  return Math.pow(linear, 2);
}

function setNaturalVolume(channel: number, linearVolume: number): void {
  const logVolume = linearToLogarithmic(linearVolume);
  setChannelVolume(channel, logVolume);
}
```

## 🎵 Smooth Volume Transitions & Easing Functions

The `audio-channel-queue` package includes built-in easing functions for creating smooth, natural-sounding volume transitions. These mathematical functions control how volume changes over time, making audio transitions feel more professional and pleasant to listen to.

### Available Easing Functions

#### Linear Easing
```typescript
// Constant rate of change - mechanical feeling
linear: (t: number): number => t
```
- **Use case**: Technical applications, precise timing
- **Feel**: Mechanical, robotic
- **Best for**: UI sound effects, technical demos

#### Ease-In
```typescript
// Starts slow, accelerates - builds anticipation
'ease-in': (t: number): number => t * t
```
- **Use case**: Fade-ins, building tension
- **Feel**: Gradual buildup, anticipation
- **Best for**: Background music fade-in, dramatic reveals

#### Ease-Out
```typescript
// Starts fast, decelerates - natural ending
'ease-out': (t: number): number => t * (2 - t)
```
- **Use case**: Fade-outs, natural endings
- **Feel**: Smooth deceleration, gentle conclusion
- **Best for**: Ending music, pause transitions

#### Ease-In-Out
```typescript
// Slow start and end, fast middle - most natural
'ease-in-out': (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
```
- **Use case**: General-purpose smooth transitions
- **Feel**: Most natural to human perception
- **Best for**: Volume ducking, crossfades, general transitions

### Custom Volume Fade Implementation

You can implement smooth volume transitions using the existing volume controls and easing functions:

```typescript
async function fadeVolume(
  channelNumber: number, 
  targetVolume: number, 
  duration: number = 1000,
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease-in-out'
): Promise<void> {
  const currentVolume = getChannelVolume(channelNumber);
  const steps = 20;
  const stepDuration = duration / steps;
  
  // Easing function implementations
  const easingFunctions = {
    linear: (t: number): number => t,
    'ease-in': (t: number): number => t * t,
    'ease-out': (t: number): number => t * (2 - t),
    'ease-in-out': (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  };
  
  const easingFunc = easingFunctions[easing];
  
  return new Promise((resolve) => {
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = easingFunc(progress);
      const newVolume = currentVolume + (targetVolume - currentVolume) * easedProgress;
      
      setChannelVolume(channelNumber, newVolume);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setChannelVolume(channelNumber, targetVolume); // Ensure exact final value
        resolve();
      }
    }, stepDuration);
  });
}

// Usage examples
await fadeVolume(0, 0, 2000, 'ease-out');     // Fade out over 2 seconds
await fadeVolume(1, 1, 1000, 'ease-in');      // Fade in over 1 second  
await fadeVolume(0, 0.3, 500, 'ease-in-out'); // Duck to 30% volume
```

### Real-World Easing Examples

#### Gaming Audio Manager
```typescript
class GameAudioManager {
  async startLevel(): Promise<void> {
    // Start background music with fade-in
    await queueAudio('./music/level-bg.mp3', 0, { loop: true, volume: 0 });
    await fadeVolume(0, 0.6, 2000, 'ease-in');
  }
  
  async playDialogue(audioFile: string): Promise<void> {
    // Duck background music for dialogue
    await fadeVolume(0, 0.1, 500, 'ease-in-out');
    await queueAudio(audioFile, 1);
    
    // Restore background music when dialogue ends
    onAudioComplete(1, async () => {
      await fadeVolume(0, 0.6, 500, 'ease-in-out');
    });
  }
  
  async endLevel(): Promise<void> {
    // Fade out all audio
    await Promise.all([
      fadeVolume(0, 0, 3000, 'ease-out'),
      fadeVolume(1, 0, 1000, 'ease-out')
    ]);
  }
}
```

#### Podcast Player
```typescript
class PodcastPlayer {
  async insertAd(): Promise<void> {
    // Fade out podcast, play ad, fade back in
    await fadeVolume(0, 0.1, 800, 'ease-in-out');
    await queueAudioPriority('./ads/sponsor.mp3', 1);
    
    onAudioComplete(1, async () => {
      await fadeVolume(0, 1.0, 800, 'ease-in-out');
    });
  }
  
  async pauseWithFade(): Promise<void> {
    await fadeVolume(0, 0, 1000, 'ease-out');
    await pauseChannel(0);
    setChannelVolume(0, 1.0); // Reset for resume
  }
  
  async resumeWithFade(): Promise<void> {
    setChannelVolume(0, 0);
    await resumeChannel(0);
    await fadeVolume(0, 1.0, 1000, 'ease-in');
  }
}
```

### Why Easing Matters

#### Human Perception
- **Linear transitions** sound mechanical and unnatural
- **Eased transitions** match how we naturally expect sound to behave
- **Logarithmic perception** - our ears are more sensitive to changes at lower volumes

#### Professional Audio Standards
- **Broadcasting**: Smooth fades prevent jarring transitions
- **Gaming**: Immersive audio requires seamless volume changes
- **Music Production**: Crossfades and automation use easing curves

#### Technical Benefits
- **CPU Efficiency**: Fewer audio dropouts with smooth transitions
- **Memory Management**: Gradual changes prevent sudden resource spikes
- **User Experience**: Professional-feeling audio enhances perceived quality

## Volume Persistence

Save and restore user preferences:

```typescript
class VolumeManager {
  private readonly STORAGE_KEY = 'audioChannelVolumes';

  saveVolumes(): void {
    const volumes = {
      music: getChannelVolume(0),
      sfx: getChannelVolume(1),
      voice: getChannelVolume(2),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(volumes));
  }

  loadVolumes(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const volumes = JSON.parse(saved);
      setChannelVolume(0, volumes.music || 0.7);
      setChannelVolume(1, volumes.sfx || 0.8);
      setChannelVolume(2, volumes.voice || 1.0);
    }
  }
} 