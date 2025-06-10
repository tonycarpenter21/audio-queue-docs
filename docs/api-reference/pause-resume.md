# Pause & Resume

Control playback state across individual channels or all channels simultaneously.

## pauseChannel

Pauses audio playback on a specific channel.

### Syntax

```typescript
pauseChannel(channelNumber: number): void
```

### Parameters

- `channelNumber` (number): The channel number to pause (0-based index)

### Examples

```typescript
import { pauseChannel, resumeChannel } from 'audio-channel-queue';

// Pause music channel
pauseChannel(0);

// Pause sound effects channel
pauseChannel(1);
```

### Real-world Usage

```typescript
class GameAudioController {
  private readonly MUSIC_CHANNEL = 0;
  private readonly SFX_CHANNEL = 1;

  pauseGame(): void {
    // Pause all game audio when game is paused
    pauseChannel(this.MUSIC_CHANNEL);
    pauseChannel(this.SFX_CHANNEL);
  }

  pauseMusicOnly(): void {
    // Keep SFX playing but pause background music
    pauseChannel(this.MUSIC_CHANNEL);
  }

  handleUserInteraction(): void {
    // Pause SFX during important dialog
    pauseChannel(this.SFX_CHANNEL);
  }
}
```

## resumeChannel

Resumes audio playback on a specific channel.

### Syntax

```typescript
resumeChannel(channelNumber: number): void
```

### Parameters

- `channelNumber` (number): The channel number to resume (0-based index)

### Examples

```typescript
import { pauseChannel, resumeChannel } from 'audio-channel-queue';

// Resume music channel
resumeChannel(0);

// Resume after temporary pause
function temporaryPause(): void {
  pauseChannel(1);
  
  setTimeout(() => {
    resumeChannel(1); // Resume after 3 seconds
  }, 3000);
}
```

## togglePauseChannel

Toggles the pause state of a specific channel.

### Syntax

```typescript
togglePauseChannel(channelNumber: number): void
```

### Parameters

- `channelNumber` (number): The channel number to toggle (0-based index)

### Examples

```typescript
import { togglePauseChannel } from 'audio-channel-queue';

// Toggle music playback with a single function
function toggleMusic(): void {
  togglePauseChannel(0); // Pauses if playing, resumes if paused
}

// Create a music player with play/pause button
class SimpleMusicPlayer {
  private readonly MUSIC_CHANNEL = 0;

  onPlayPauseClick(): void {
    togglePauseChannel(this.MUSIC_CHANNEL);
  }
}
```

## pauseAllChannels

Pauses audio playback on all channels simultaneously.

### Syntax

```typescript
pauseAllChannels(): void
```

### Examples

```typescript
import { pauseAllChannels, resumeAllChannels } from 'audio-channel-queue';

// Global pause functionality
function pauseAllAudio(): void {
  pauseAllChannels();
}

// Pause everything when app loses focus
window.addEventListener('blur', () => {
  pauseAllChannels();
});
```

### Real-world Usage

```typescript
class ApplicationAudioManager {
  pauseForPhoneCall(): void {
    // Pause all audio when phone call is detected (mobile)
    pauseAllChannels();
  }

  pauseForNotification(): void {
    // Pause all audio for important system notifications
    pauseAllChannels();
  }

  handleVisibilityChange(): void {
    if (document.hidden) {
      pauseAllChannels(); // Pause when tab is hidden
    } else {
      resumeAllChannels(); // Resume when tab becomes visible
    }
  }
}
```

## resumeAllChannels

Resumes audio playback on all channels simultaneously.

### Syntax

```typescript
resumeAllChannels(): void
```

### Examples

```typescript
import { pauseAllChannels, resumeAllChannels } from 'audio-channel-queue';

// Global resume functionality
function resumeAllAudio(): void {
  resumeAllChannels();
}

// Resume when app regains focus
window.addEventListener('focus', () => {
  resumeAllChannels();
});
```

## togglePauseAllChannels

Toggles the pause state of all channels simultaneously.

### Syntax

```typescript
togglePauseAllChannels(): void
```

### Examples

```typescript
import { togglePauseAllChannels } from 'audio-channel-queue';

// Master play/pause control
function masterToggle(): void {
  togglePauseAllChannels();
}

// Keyboard shortcut for space bar
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !event.target.matches('input')) {
    event.preventDefault();
    togglePauseAllChannels();
  }
});
```

## isChannelPaused

Checks if a specific channel is currently paused.

### Syntax

```typescript
isChannelPaused(channelNumber: number): boolean
```

### Parameters

- `channelNumber` (number): The channel number to check (0-based index)

### Returns

- `boolean`: `true` if the channel is paused, `false` if playing

### Examples

```typescript
import { isChannelPaused, pauseChannel, resumeChannel } from 'audio-channel-queue';

// Conditional pause/resume logic
function smartToggle(channel: number): void {
  if (isChannelPaused(channel)) {
    resumeChannel(channel);
    console.log(`Channel ${channel} resumed`);
  } else {
    pauseChannel(channel);
    console.log(`Channel ${channel} paused`);
  }
}

// UI state management
function updatePlayButton(channel: number): void {
  const button = document.getElementById('play-button');
  if (button) {
    button.textContent = isChannelPaused(channel) ? '▶️ Play' : '⏸️ Pause';
  }
}
```

## getAllChannelsPauseState

Gets the pause state for all channels.

### Syntax

```typescript
getAllChannelsPauseState(): { [channelNumber: number]: boolean }
```

### Returns

- `Object`: Map of channel numbers to their pause states

### Examples

```typescript
import { getAllChannelsPauseState } from 'audio-channel-queue';

// Get pause state for all channels
const pauseStates = getAllChannelsPauseState();
console.log(pauseStates); // { 0: false, 1: true, 2: false }

// Update UI for all channels
function updateAllPlayButtons(): void {
  const states = getAllChannelsPauseState();
  
  Object.entries(states).forEach(([channel, isPaused]) => {
    const button = document.getElementById(`play-button-${channel}`);
    if (button) {
      button.textContent = isPaused ? '▶️' : '⏸️';
      button.className = isPaused ? 'paused' : 'playing';
    }
  });
}
```

### Real-world Usage

```typescript
class AudioDashboard {
  private updateInterval: number | null = null;

  startMonitoring(): void {
    this.updateInterval = setInterval(() => {
      const states = getAllChannelsPauseState();
      this.updateChannelIndicators(states);
    }, 100);
  }

  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private updateChannelIndicators(states: { [key: number]: boolean }): void {
    Object.entries(states).forEach(([channel, isPaused]) => {
      const indicator = document.querySelector(`[data-channel="${channel}"]`);
      if (indicator) {
        indicator.classList.toggle('paused', isPaused);
        indicator.classList.toggle('playing', !isPaused);
      }
    });
  }
}
```

## Advanced Pause/Resume Patterns

### 1. Smart Auto-Pause

Automatically pause audio based on system events:

```typescript
class SmartAudioManager {
  private wasPlayingBeforePause: { [channel: number]: boolean } = {};

  setupAutoPause(): void {
    // Auto-pause on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.smartPauseAll();
      } else {
        this.smartResumeAll();
      }
    });

    // Auto-pause on low battery (if supported)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.1) { // Below 10%
            this.smartPauseAll();
          }
        });
      });
    }
  }

  private smartPauseAll(): void {
    const states = getAllChannelsPauseState();
    
    // Remember which channels were playing
    Object.entries(states).forEach(([channel, isPaused]) => {
      this.wasPlayingBeforePause[parseInt(channel)] = !isPaused;
    });
    
    pauseAllChannels();
  }

  private smartResumeAll(): void {
    // Only resume channels that were playing before pause
    Object.entries(this.wasPlayingBeforePause).forEach(([channel, wasPlaying]) => {
      if (wasPlaying) {
        resumeChannel(parseInt(channel));
      }
    });
    
    this.wasPlayingBeforePause = {};
  }
}
```

### 2. Fade Pause/Resume

Create smooth transitions when pausing/resuming:

```typescript
async function fadeOutAndPause(channel: number, duration: number = 1000): Promise<void> {
  const originalVolume = getChannelVolume(channel);
  const steps = 20;
  const stepDuration = duration / steps;
  const volumeStep = originalVolume / steps;

  return new Promise((resolve) => {
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const newVolume = originalVolume - (volumeStep * currentStep);
      setChannelVolume(channel, Math.max(0, newVolume));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        pauseChannel(channel);
        setChannelVolume(channel, originalVolume); // Restore volume for next play
        resolve();
      }
    }, stepDuration);
  });
}

async function resumeAndFadeIn(channel: number, duration: number = 1000): Promise<void> {
  const targetVolume = getChannelVolume(channel);
  setChannelVolume(channel, 0);
  resumeChannel(channel);
  
  const steps = 20;
  const stepDuration = duration / steps;
  const volumeStep = targetVolume / steps;

  return new Promise((resolve) => {
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const newVolume = volumeStep * currentStep;
      setChannelVolume(channel, Math.min(targetVolume, newVolume));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        resolve();
      }
    }, stepDuration);
  });
}
```

### 3. Conditional Pause Control

Pause based on application state:

```typescript
class ConditionalPauseManager {
  private shouldAutoPause: boolean = true;
  private userPreferences = {
    pauseOnLowBattery: true,
    pauseOnCall: true,
    pauseOnNotification: false,
  };

  setPausePreference(type: keyof typeof this.userPreferences, enabled: boolean): void {
    this.userPreferences[type] = enabled;
  }

  conditionalPause(reason: string): void {
    if (!this.shouldAutoPause) return;

    switch (reason) {
      case 'low-battery':
        if (this.userPreferences.pauseOnLowBattery) {
          pauseAllChannels();
        }
        break;
      
      case 'phone-call':
        if (this.userPreferences.pauseOnCall) {
          pauseAllChannels();
        }
        break;
      
      case 'notification':
        if (this.userPreferences.pauseOnNotification) {
          // Only pause non-essential channels
          pauseChannel(0); // Background music
          // Keep voice/SFX channels playing
        }
        break;
    }
  }

  enableAutoPause(): void {
    this.shouldAutoPause = true;
  }

  disableAutoPause(): void {
    this.shouldAutoPause = false;
  }
} 