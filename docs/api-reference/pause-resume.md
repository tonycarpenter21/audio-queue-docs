# Pause & Resume

Control playback state across individual channels or all channels simultaneously.

## pauseChannel

Pauses audio playback on a specific channel.

### Syntax

```typescript
pauseChannel(channelNumber?: number = 0): Promise<void>
```

### Examples

```typescript
import { pauseChannel, resumeChannel } from 'audio-channel-queue';

// Pause music channel
await pauseChannel(0);

// Pause sound effects channel
await pauseChannel(1);

// Best practice: handle pause with state tracking
const pausedChannels = new Set<number>();

async function pauseAndTrack(channel: number): Promise<void> {
  await pauseChannel(channel);
  pausedChannels.add(channel);
}

// Pro tip: pause non-critical audio during voice
async function prioritizeVoice(): Promise<void> {
  await pauseChannel(0); // Pause music
  await pauseChannel(1); // Pause SFX
  // Keep voice channel (2) playing
}
```

## resumeChannel

Resumes audio playback on a specific channel.

### Syntax

```typescript
resumeChannel(channelNumber?: number = 0): Promise<void>
```

### Examples

```typescript
import { pauseChannel, resumeChannel } from 'audio-channel-queue';

// Resume music channel
await resumeChannel(0);

// Resume after temporary pause
async function temporaryPause(): Promise<void> {
  await pauseChannel(1);
  
  setTimeout(async () => {
    await resumeChannel(1); // Resume after 3 seconds
  }, 3000);
}
```

## togglePauseChannel

Toggles the pause state of a specific channel.

### Syntax

```typescript
togglePauseChannel(channelNumber?: number = 0): Promise<void>
```

### Examples

```typescript
import { togglePauseChannel } from 'audio-channel-queue';

// Toggle music playback with a single function
async function toggleMusic(): Promise<void> {
  await togglePauseChannel(0); // Pauses if playing, resumes if paused
}

// Create a music player with play/pause button
class SimpleMusicPlayer {
  private readonly MUSIC_CHANNEL = 0;

  async onPlayPauseClick(): Promise<void> {
    await togglePauseChannel(this.MUSIC_CHANNEL);
  }
}

// Best practice: debounce rapid toggles
let toggleTimeout: number | null = null;

async function safeTogglePause(channel: number): Promise<void> {
  if (toggleTimeout) clearTimeout(toggleTimeout);
  
  toggleTimeout = setTimeout(async () => {
    await togglePauseChannel(channel);
    toggleTimeout = null;
  }, 100); // 100ms debounce
}

// Pro tip: prevent space bar from scrolling
document.addEventListener('keydown', async (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault(); // Stop page scroll
    await togglePauseChannel(0);
  }
});
```

## pauseAllChannels

Pauses audio playback on all channels simultaneously.

### Syntax

```typescript
pauseAllChannels(): Promise<void>
```

### Examples

```typescript
import { pauseAllChannels, resumeAllChannels } from 'audio-channel-queue';

// Global pause functionality
async function pauseAllAudio(): Promise<void> {
  await pauseAllChannels();
}

// Pause everything when app loses focus
window.addEventListener('blur', async () => {
  await pauseAllChannels();
});

// Best practice: use Page Visibility API for better battery life
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    await pauseAllChannels(); // Save battery when tab not visible
  } else {
    await resumeAllChannels(); // Resume when user returns
  }
});

// Pro tip: mobile app lifecycle handling
if ('onpause' in document) {
  // Cordova/Capacitor mobile apps
  document.addEventListener('pause', async () => await pauseAllChannels());
  document.addEventListener('resume', async () => await resumeAllChannels());
}
```

## resumeAllChannels

Resumes audio playback on all channels simultaneously.

### Syntax

```typescript
resumeAllChannels(): Promise<void>
```

### Examples

```typescript
import { pauseAllChannels, resumeAllChannels } from 'audio-channel-queue';

// Global resume functionality
async function resumeAllAudio(): Promise<void> {
  await resumeAllChannels();
}

// Resume when app regains focus
window.addEventListener('focus', async () => {
  await resumeAllChannels();
});
```

## togglePauseAllChannels

Toggles the pause state of all channels simultaneously.

### Syntax

```typescript
togglePauseAllChannels(): Promise<void>
```

### Examples

```typescript
import { togglePauseAllChannels } from 'audio-channel-queue';

// Play/pause control
async function playbackToggle(): Promise<void> {
  await togglePauseAllChannels();
}

// Keyboard shortcut for space bar
document.addEventListener('keydown', async (event) => {
  if (event.code === 'Space' && !event.target.matches('input')) {
    event.preventDefault();
    await togglePauseAllChannels();
  }
});
```

## isChannelPaused

Checks if a specific channel is currently paused.

### Syntax

```typescript
isChannelPaused(channelNumber?: number = 0): boolean
```

### Returns

- `boolean`: `true` if the channel is paused, `false` if playing

### Examples

```typescript
import { isChannelPaused, pauseChannel, resumeChannel } from 'audio-channel-queue';

// Conditional pause/resume logic
async function smartToggle(channel: number): Promise<void> {
  if (isChannelPaused(channel)) {
    await resumeChannel(channel);
    console.log(`Channel ${channel} resumed`);
  } else {
    await pauseChannel(channel);
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

// Best practice: sync UI state on animation frame
function syncUIWithAudioState(): void {
  requestAnimationFrame(() => {
    const isPaused = isChannelPaused(0);
    document.querySelectorAll('.play-button').forEach(btn => {
      btn.classList.toggle('playing', !isPaused);
      btn.classList.toggle('paused', isPaused);
    });
  });
}

// Pro tip: prevent race conditions with state checks
async function safeResume(channel: number): Promise<void> {
  if (!isChannelPaused(channel)) {
    console.warn(`Channel ${channel} already playing`);
    return;
  }
  await resumeChannel(channel);
}
```

## getAllChannelsPauseState

Gets the pause state of all channels.

### Syntax

```typescript
getAllChannelsPauseState(): boolean[]
```

### Returns

- `boolean[]`: Array of boolean values indicating pause state for each channel (index corresponds to channel number)

### Examples

```typescript
import { getAllChannelsPauseState } from 'audio-channel-queue';

// Get pause state for all channels
const pauseStates = getAllChannelsPauseState();
console.log(pauseStates); // [false, true, false, false, false, false, false, false]
// Channel 0: playing, Channel 1: paused, Channel 2: playing, etc.

// Update UI for all channels
function updateAllPlayButtons(): void {
  const states = getAllChannelsPauseState();
  
  states.forEach((isPaused, channel) => {
    const button = document.getElementById(`play-button-${channel}`);
    if (button) {
      button.textContent = isPaused ? '▶️' : '⏸️';
      button.className = isPaused ? 'paused' : 'playing';
    }
  });
}
```

## pauseWithFade

Pauses the currently playing audio in a specific channel with a smooth volume fade out.

### Syntax

```typescript
pauseWithFade(fadeType?: FadeType, channelNumber?: number, duration?: number): Promise<void>
```

### Parameters

- `fadeType` (FadeType, optional): Type of fade transition to apply (defaults to `FadeType.Gentle`)
- `channelNumber` (number, optional): The channel number to pause (defaults to 0)
- `duration` (number, optional): Custom fade duration in milliseconds (uses fadeType default if not provided)

### Examples

```typescript
import { pauseWithFade, FadeType } from 'audio-channel-queue';

// Pause with default gentle fade (FadeType.Gentle, channel 0, 800ms)
await pauseWithFade();

// Pause with dramatic fade on channel 1 800mx
await pauseWithFade(FadeType.Dramatic, 1);

// Pause with linear fade on channel 0 with custom 500ms duration
await pauseWithFade(FadeType.Linear, 0, 500);

// Best practice: use FadeType enum
await pauseWithFade(FadeType.Gentle); // 800ms ease-out on channel 0
await pauseWithFade(FadeType.Dramatic); // 800ms ease-in on channel 0
await pauseWithFade(FadeType.Linear); // 800ms linear on channel 0
```

## resumeWithFade

Resumes the currently paused audio in a specific channel with a smooth volume fade in. Uses the complementary fade curve automatically based on the pause fade type, or allows override.

### Syntax

```typescript
resumeWithFade(fadeType?: FadeType, channelNumber?: number, duration?: number): Promise<void>
```

### Parameters

- `fadeType` (FadeType, optional): Override fade type (if not provided, uses the stored fade type from pause)
- `channelNumber` (number, optional): The channel number to resume (defaults to 0)
- `duration` (number, optional): Custom fade duration in milliseconds (uses stored or fadeType default if not provided)

### Examples

```typescript
import { pauseWithFade, resumeWithFade, FadeType } from 'audio-channel-queue';

// Pause then resume with automatic paired curves
await pauseWithFade(FadeType.Gentle); // Pauses with ease-out
await resumeWithFade(); // Resumes with ease-in (complementary curve)

// Override with different fade type
await pauseWithFade(FadeType.Gentle);
await resumeWithFade(FadeType.Dramatic); // Override with dramatic fade

// Resume with custom duration
await resumeWithFade(undefined, 0, 1000); // Use stored fade type, channel 0, 1 second duration

// Best practice: let the library handle curve pairing
await pauseWithFade(FadeType.Gentle, 0, 500);
await resumeWithFade(); // Automatically uses gentle fade with 500ms duration
```

## togglePauseWithFade

Toggles pause/resume state for a specific channel with integrated fade transitions.

### Syntax

```typescript
togglePauseWithFade(fadeType?: FadeType, channelNumber?: number, duration?: number): Promise<void>
```

### Parameters

- `fadeType` (FadeType, optional): Type of fade transition to apply when pausing (defaults to FadeType.Gentle)
- `channelNumber` (number, optional): The channel number to toggle (defaults to 0)
- `duration` (number, optional): Custom fade duration in milliseconds (uses fadeType default if not provided)

### Examples

```typescript
import { togglePauseWithFade, FadeType } from 'audio-channel-queue';

// Toggle with default gentle fade
await togglePauseWithFade();

// Toggle with dramatic fade on channel 1
await togglePauseWithFade(FadeType.Dramatic, 1);

// Toggle with custom duration on channel 0
await togglePauseWithFade(FadeType.Linear, 0, 300);
```

## pauseAllWithFade

Pauses all currently playing audio across all channels with smooth volume fade.

### Syntax

```typescript
pauseAllWithFade(fadeType?: FadeType, duration?: number): Promise<void>
```

### Parameters

- `fadeType` (FadeType, optional): Type of fade transition to apply to all channels (defaults to FadeType.Gentle)
- `duration` (number, optional): Custom fade duration in milliseconds (uses fadeType default if not provided)

### Examples

```typescript
import { pauseAllWithFade, FadeType } from 'audio-channel-queue';

// Pause all channels with gentle fade
await pauseAllWithFade();

// Pause all with dramatic fade
await pauseAllWithFade(FadeType.Dramatic);

// Pause all with custom 1.2 second fade
await pauseAllWithFade(FadeType.Gentle, 1200);
```

## resumeAllWithFade

Resumes all currently paused audio across all channels with smooth volume fade. Uses automatically paired fade curves based on each channel's pause fade type, or allows override.

### Syntax

```typescript
resumeAllWithFade(fadeType?: FadeType, duration?: number): Promise<void>
```

### Parameters

- `fadeType` (FadeType, optional): Override fade type for all channels (if not provided, uses each channel's stored fade type)
- `duration` (number, optional): Custom fade duration in milliseconds (uses stored or fadeType default if not provided)

### Examples

```typescript
import { pauseAllWithFade, resumeAllWithFade, FadeType } from 'audio-channel-queue';

// Resume all with their paired fade curves
await resumeAllWithFade();

// Override all channels with gentle fade
await resumeAllWithFade(FadeType.Gentle);

// Resume all with custom duration, keeping stored fade types
await resumeAllWithFade(undefined, 600);
```

## togglePauseAllWithFade

Toggles pause/resume state for all channels with integrated fade. If any channels are playing, all will be paused with fade. If all channels are paused, all will be resumed with fade.

### Syntax

```typescript
togglePauseAllWithFade(fadeType?: FadeType, duration?: number): Promise<void>
```

### Parameters

- `fadeType` (FadeType, optional): Type of fade transition to apply when pausing (defaults to FadeType.Gentle)
- `duration` (number, optional): Custom fade duration in milliseconds (uses fadeType default if not provided)

### Examples

```typescript
import { togglePauseAllWithFade, FadeType } from 'audio-channel-queue';

// Toggle all with default gentle fade
await togglePauseAllWithFade();

// Toggle all with dramatic fade
await togglePauseAllWithFade(FadeType.Dramatic);

// Toggle with custom 600ms fade
await togglePauseAllWithFade(FadeType.Gentle, 600);
```

## Fade Types

The fade functions support three fade types via the `FadeType` enum:

- **`FadeType.Gentle`** (default): Smooth, gradual transition
  - Duration: 800ms
  - Pause curve: ease-out (decelerates)
  - Resume curve: ease-in (accelerates)
  
- **`FadeType.Dramatic`**: Quick, noticeable transition
  - Duration: 800ms  
  - Pause curve: ease-in (accelerates)
  - Resume curve: ease-out (decelerates)
  
- **`FadeType.Linear`**: Constant rate transition
  - Duration: 800ms
  - Both curves: linear

## Real-world Usage

### 1. Smart Auto-Pause

Automatically pause audio based on system events:

```typescript
import { pauseAllChannels, resumeChannel, getAllChannelsPauseState } from 'audio-channel-queue';

class SmartAudioManager {
  private wasPlayingBeforePause: { [channel: number]: boolean } = {};

  setupAutoPause(): void {
    // Auto-pause on visibility change
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) {
        await this.smartPauseAll();
      } else {
        await this.smartResumeAll();
      }
    });
  }

  private async smartPauseAll(): Promise<void> {
    const states = getAllChannelsPauseState();
    
    // Remember which channels were playing
    states.forEach((isPaused, channel) => {
      this.wasPlayingBeforePause[channel] = !isPaused;
    });
    
    await pauseAllChannels();
  }

  private async smartResumeAll(): Promise<void> {
    // Only resume channels that were playing before pause
    const resumePromises = Object.entries(this.wasPlayingBeforePause)
      .filter(([_, wasPlaying]) => wasPlaying)
      .map(([channel]) => resumeChannel(parseInt(channel)));
    
    await Promise.all(resumePromises);
    this.wasPlayingBeforePause = {};
  }
}
```

### 2. Advanced Fade Scenarios

Create complex fade behaviors:

```typescript
import { pauseWithFade, resumeWithFade, FadeType, isChannelPaused } from 'audio-channel-queue';

// Smooth cross-fade between channels
async function crossFadeChannels(fadeOutChannel: number, fadeInChannel: number): Promise<void> {
  // Start both operations simultaneously
  await Promise.all([
    pauseWithFade(FadeType.Gentle, fadeOutChannel, 1000),
    resumeWithFade(FadeType.Gentle, fadeInChannel, 1000)
  ]);
}

// Progressive pause across multiple channels
async function cascadePause(channels: number[], delayMs: number = 200): Promise<void> {
  const pausePromises: Promise<void>[] = [];
  
  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const promise = new Promise<void>((resolve) => {
      setTimeout(async () => {
        await pauseWithFade(FadeType.Gentle, channel, 600);
        resolve();
      }, i * delayMs);
    });
    pausePromises.push(promise);
  }
  
  await Promise.all(pausePromises);
}

// Reactive fade based on user proximity
class ProximityFader {
  async adjustForDistance(channel: number, distance: number, maxDistance: number): Promise<void> {
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    if (normalizedDistance >= 0.8 && !isChannelPaused(channel)) {
      // Fade out when far away
      await pauseWithFade(FadeType.Linear, channel, 2000);
    } else if (normalizedDistance < 0.8 && isChannelPaused(channel)) {
      // Fade in when getting closer
      await resumeWithFade(FadeType.Linear, channel, 2000);
    }
  }
}
```

### 3. Conditional Pause Control

Pause based on application state:

```typescript
import { pauseAllChannels, pauseChannel } from 'audio-channel-queue';

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

  async conditionalPause(reason: string): Promise<void> {
    if (!this.shouldAutoPause) return;

    switch (reason) {
      case 'low-battery':
        if (this.userPreferences.pauseOnLowBattery) {
          await pauseAllChannels();
        }
        break;
      
      case 'phone-call':
        if (this.userPreferences.pauseOnCall) {
          await pauseAllChannels();
        }
        break;
      
      case 'notification':
        if (this.userPreferences.pauseOnNotification) {
          // Only pause non-essential channels
          await pauseChannel(0); // Background music
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
```

## Next Steps

Now that you understand the Pause & Resume system, explore:

- **[Advanced Queue Manipulation](./advanced-queue-manipulation.md)** - Precise queue control and monitoring
- **[Audio Information](./audio-information.md)** - Get real-time audio data
- **[Queue Management](./queue-management.md)** - Control audio queues
- **[Volume Control](./volume-control.md)** - Manage audio levels
- **[Examples](../getting-started/basic-usage)** - Real-world event handling patterns 