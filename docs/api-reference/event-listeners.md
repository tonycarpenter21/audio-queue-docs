# Event Listeners

Listen for audio events to create responsive user interfaces and track playback behavior.

## onAudioStart

Listen for when audio begins playing on a specific channel.

### Syntax

```typescript
onAudioStart(channelNumber: number, callback: (info: AudioStartInfo) => void): void
```

### AudioStartInfo Properties

```typescript
interface AudioStartInfo {
  channelNumber: number; // Channel number where the audio is starting
  duration: number;      // Total audio duration in milliseconds
  fileName: string;      // Extracted filename from the source URL
  src: string;           // Audio file source URL
}
```

### Examples

```typescript
import { onAudioStart, queueAudio } from 'audio-channel-queue';

// Basic usage
onAudioStart(0, (info) => {
  console.log(`Started playing: ${info.fileName}`);
  console.log(`Duration: ${info.duration}ms`);
});

// Update UI when audio starts
onAudioStart(0, (info) => {
  updateNowPlayingDisplay(info.fileName);
  setProgressBarMax(info.duration);
});

// Queue some audio to trigger the event
await queueAudio('./music/song.mp3', 0);

// The listener can be cleaned up when needed
class AudioComponent {
  onMount() {
    onAudioStart(0, this.handleAudioStart);
  }
  
  onUnmount() {
    offAudioStart(0); // Clean up the listener
  }
  
  private handleAudioStart = (info: AudioStartInfo) => {
    console.log(`Started: ${info.fileName}`);
  };
}

// Pro tip: debounce rapid start events
let startDebounce: number | null = null;
onAudioStart(0, (info) => {
  if (startDebounce) clearTimeout(startDebounce);
  startDebounce = setTimeout(() => {
    updateUI(info); // Prevent UI flashing on quick track changes
  }, 50);
});
```

## offAudioStart

Removes all audio start event listeners for a specific channel.

### Syntax

```typescript
offAudioStart(channelNumber: number): void
```

### Examples

```typescript
import { onAudioStart, offAudioStart } from 'audio-channel-queue';

// Set up listener
onAudioStart(0, (info) => {
  console.log(`Started: ${info.fileName}`);
});

// Later, remove all start listeners
offAudioStart(0);

// Best practice: component lifecycle management
class AudioComponent {
  private channel: number = 0;
  
  onMount() {
    onAudioStart(this.channel, this.handleAudioStart);
  }
  
  onUnmount() {
    offAudioStart(this.channel); // Clean up to prevent memory leaks
  }
  
  private handleAudioStart = (info: AudioStartInfo) => {
    console.log(`Started playing: ${info.fileName}`);
    this.updateNowPlaying(info);
  };
  
  private updateNowPlaying(info: AudioStartInfo): void {
    // Update UI with currently playing track
  }
}

// Pro tip: conditional start tracking
class StartTracker {
  private trackingEnabled = false;
  
  enableTracking() {
    if (!this.trackingEnabled) {
      onAudioStart(0, this.handleStart);
      this.trackingEnabled = true;
      console.log('Start tracking enabled');
    }
  }
  
  disableTracking() {
    if (this.trackingEnabled) {
      offAudioStart(0);
      this.trackingEnabled = false;
      console.log('Start tracking disabled');
    }
  }
  
  private handleStart = (info: AudioStartInfo) => {
    console.log(`Track started: ${info.fileName}`);
  };
}
```

## onAudioComplete

Listen for when audio finishes playing (either naturally or when interrupted).

### Syntax

```typescript
onAudioComplete(channelNumber: number, callback: (info: AudioCompleteInfo) => void): void
```

### AudioCompleteInfo Properties

```typescript
interface AudioCompleteInfo {
  channelNumber: number; // Channel number where the audio is starting
  duration: number;      // Total audio duration in milliseconds
  fileName: string;      // Extracted filename from the source URL
  src: string;           // Audio file source URL
}
```

### Examples

```typescript
import { onAudioComplete, queueAudio } from 'audio-channel-queue';

// Track completion stats
onAudioComplete(0, (info) => {
  console.log(`Completed: ${info.fileName}`);
  console.log(`Channel: ${info.channelNumber}`);
  console.log(`Source: ${info.src}`);
  console.log(`Items left: ${info.remainingInQueue}`);
});

// Auto-queue next playlist item
onAudioComplete(0, (info) => {
  if (info.remainingInQueue === 0) {
    loadNextPlaylist();
  }
});

// Best practice: track analytics on completion
onAudioComplete(0, (info) => {
  // Track all completions
  analytics.track('track_completed', {
    fileName: info.fileName,
    channelNumber: info.channelNumber,
    src: info.src,
    timestamp: Date.now()
  });
});

// Pro tip: handle end-of-queue scenarios
onAudioComplete(0, async (info) => {
  if (info.remainingInQueue === 0) {
    // Options: loop playlist, shuffle, or load recommendations
    const userPref = getUserPreference('onQueueEnd');
    
    switch (userPref) {
      case 'loop':
        await reloadCurrentPlaylist();
        break;
      case 'shuffle':
        await loadShuffledPlaylist();
        break;
      case 'stop':
        showPlaylistComplete();
        break;
    }
  }
});
```

## offAudioComplete

Removes all audio complete event listeners for a specific channel.

### Syntax

```typescript
offAudioComplete(channelNumber: number): void
```

### Examples

```typescript
import { onAudioComplete, offAudioComplete } from 'audio-channel-queue';

// Set up listener
onAudioComplete(0, (info) => {
  console.log(`Completed: ${info.fileName}`);
});

// Later, remove all complete listeners
offAudioComplete(0);

// Best practice: session-based tracking
class SessionTracker {
  private session: Array<{ fileName: string; src: string }> = [];
  private trackingEnabled = false;
  
  startSession() {
    if (!this.trackingEnabled) {
      onAudioComplete(0, this.handleComplete);
      this.trackingEnabled = true;
      console.log('Session tracking started');
    }
  }
  
  endSession() {
    if (this.trackingEnabled) {
      offAudioComplete(0);
      this.trackingEnabled = false;
      console.log('Session tracking ended');
      this.generateSessionReport();
    }
  }
  
  private handleComplete = (info: AudioCompleteInfo) => {
    this.session.push({
      fileName: info.fileName,
      src: info.src
    });
  };
  
  private generateSessionReport() {
    console.log(`Session complete: ${this.session.length} tracks played`);
    this.session = []; // Reset for next session
  }
}

// Pro tip: conditional completion tracking
class CompletionAnalytics {
  private analyticsEnabled = false;
  
  enableAnalytics() {
    if (!this.analyticsEnabled) {
      onAudioComplete(0, this.trackCompletion);
      this.analyticsEnabled = true;
    }
  }
  
  disableAnalytics() {
    if (this.analyticsEnabled) {
      offAudioComplete(0);
      this.analyticsEnabled = false;
    }
  }
  
  private trackCompletion = (info: AudioCompleteInfo) => {
    // Track all completions with available data
    analytics.track('track_completed', {
      fileName: info.fileName,
      channelNumber: info.channelNumber,
      src: info.src,
      remainingInQueue: info.remainingInQueue
    });
  };
}
```

## onAudioPause

Listen for when audio is paused on a specific channel.

### Syntax

```typescript
onAudioPause(channelNumber: number, callback: (channelNumber: number, info: AudioInfo) => void): void
```

### AudioInfo Properties

```typescript
interface AudioInfo {
  currentTime: number;      // Current playback position in milliseconds
  duration: number;         // Total audio duration in milliseconds
  fileName: string;         // Extracted filename from the source URL
  isLooping: boolean;       // Whether the audio is set to loop
  isPaused: boolean;        // Whether the audio is currently paused
  isPlaying: boolean;       // Whether the audio is currently playing
  progress: number;         // Playback progress as a decimal (0-1)
  remainingInQueue: number; // Number of audio files remaining in the queue after current
  src: string;              // Audio file source URL
  volume: number;            // Current volume level (0-1)
}
```

### Examples

```typescript
import { onAudioPause, pauseChannel } from 'audio-channel-queue';

// Update UI when audio is paused
onAudioPause(0, (channelNumber, info) => {
  console.log(`Music paused on channel ${channelNumber}`);
  console.log(`Track: ${info.fileName} at ${info.currentTime}ms`);
  updatePlayButtonState('play');
  showPausedOverlay();
});

// Track pause events for analytics
onAudioPause(0, (channelNumber, info) => {
  analytics.track('audio_paused', {
    channel: channelNumber,
    fileName: info.fileName,
    timestamp: Date.now()
  });
});

// Pause the audio to trigger the event
await pauseChannel(0);
```

## offAudioPause

Removes all audio pause event listeners for a specific channel.

### Syntax

```typescript
offAudioPause(channelNumber: number): void
```

### Examples

```typescript
import { onAudioPause, offAudioPause } from 'audio-channel-queue';

// Set up listener
onAudioPause(0, (channelNumber, info) => {
  console.log(`Paused: ${info.fileName} at ${info.currentTime}ms`);
});

// Later, remove all pause listeners
offAudioPause(0);

// Best practice: conditional pause tracking
class PauseTracker {
  private trackingEnabled = false;
  
  enableTracking() {
    if (!this.trackingEnabled) {
      onAudioPause(0, this.handlePause);
      this.trackingEnabled = true;
    }
  }
  
  disableTracking() {
    if (this.trackingEnabled) {
      offAudioPause(0);
      this.trackingEnabled = false;
    }
  }
  
  private handlePause = (channelNumber: number, info: AudioInfo) => {
    this.logPauseEvent(channelNumber, info);
  };
  
  private logPauseEvent(channelNumber: number, info: AudioInfo) {
    console.log(`Pause event: Channel ${channelNumber}, ${info.fileName} at ${info.currentTime}ms`);
  }
}

// Pro tip: paired pause/resume tracking
function setupPauseResumeTracking(channel: number) {
  onAudioPause(channel, (channelNumber, info) => {
    console.log(`Channel ${channelNumber} paused`);
  });
  
  onAudioResume(channel, (channelNumber, info) => {
    console.log(`Channel ${channelNumber} resumed`);
  });
}

function cleanupPauseResumeTracking(channel: number) {
  offAudioPause(channel);
  offAudioResume(channel);
}
```


## onAudioResume

Listen for when audio is resumed on a specific channel.

### Syntax

```typescript
onAudioResume(channelNumber: number, callback: (channelNumber: number, info: AudioInfo) => void): void
```

### AudioInfo Properties

```typescript
interface AudioInfo {
  currentTime: number;      // Current playback position in milliseconds
  duration: number;         // Total audio duration in milliseconds
  fileName: string;         // Extracted filename from the source URL
  isLooping: boolean;       // Whether the audio is set to loop
  isPaused: boolean;        // Whether the audio is currently paused
  isPlaying: boolean;       // Whether the audio is currently playing
  progress: number;         // Playback progress as a decimal (0-1)
  remainingInQueue: number; // Number of audio files remaining in the queue after current
  src: string;              // Audio file source URL
  volume: number;            // Current volume level (0-1)
}
```

### Examples

```typescript
import { onAudioResume, resumeChannel } from 'audio-channel-queue';

// Update UI when audio resumes
onAudioResume(0, (channelNumber, info) => {
  console.log(`Music resumed on channel ${channelNumber}`);
  console.log(`Track: ${info.fileName} at ${info.currentTime}ms`);
  updatePlayButtonState('pause');
  hidePausedOverlay();
});

// Track resume events
onAudioResume(0, (channelNumber, info) => {
  analytics.track('audio_resumed', {
    channel: channelNumber,
    fileName: info.fileName,
    timestamp: Date.now()
  });
});

// Resume the audio to trigger the event
await resumeChannel(0);
```

## offAudioResume

Removes all audio resume event listeners for a specific channel.

### Syntax

```typescript
offAudioResume(channelNumber: number): void
```

### Examples

```typescript
import { onAudioResume, offAudioResume } from 'audio-channel-queue';

// Set up listener
onAudioResume(0, (channelNumber, info) => {
  console.log(`Resumed: ${info.fileName} at ${info.currentTime}ms`);
});

// Later, remove all resume listeners
offAudioResume(0);

// Best practice: lifecycle management
class AudioComponent {
  private channel: number;
  
  constructor(channel: number) {
    this.channel = channel;
  }
  
  onMount() {
    onAudioResume(this.channel, this.handleResume);
  }
  
  onUnmount() {
    offAudioResume(this.channel);
  }
  
  private handleResume = (channelNumber: number, info: AudioInfo) => {
    console.log(`Channel ${channelNumber} resumed playback`);
    this.updateUI(info);
  };
  
  private updateUI(info: AudioInfo): void {
    // Update UI to reflect resumed state
  }
}
```

## onAudioProgress

Listen for real-time progress updates during audio playback.

### Syntax

```typescript
onAudioProgress(channelNumber: number, callback: (info: AudioInfo) => void): void
```

### AudioInfo Properties

```typescript
interface AudioInfo {
  currentTime: number;      // Current playback position in milliseconds
  duration: number;         // Total audio duration in milliseconds
  fileName: string;         // Extracted filename from the source URL
  isLooping: boolean;       // Whether the audio is set to loop
  isPaused: boolean;        // Whether the audio is currently paused
  isPlaying: boolean;       // Whether the audio is currently playing
  progress: number;         // Playback progress as a decimal (0-1)
  remainingInQueue: number; // Number of audio files remaining in the queue after current
  src: string;              // Audio file source URL
  volume: number;            // Current volume level (0-1)
}
```

### Examples

```typescript
import { onAudioProgress } from 'audio-channel-queue';

// Update progress bar
onAudioProgress(0, (info) => {
  const percentage = Math.round(info.progress * 100);
  updateProgressBar(percentage);
  updateTimeDisplay(info.currentTime, info.duration);
});

// Trigger events at specific times
onAudioProgress(0, (info) => {
  // Fade out near the end
  if (info.progress > 0.95) {
    startFadeOut();
  }
  
  // Show lyrics at specific timestamps
  showLyricsAtTime(info.currentTime);
});

// Best practice: throttle progress updates for performance
let lastUpdate = 0;
onAudioProgress(0, (info) => {
  const now = Date.now();
  if (now - lastUpdate < 100) return; // Update max 10 times/second
  
  lastUpdate = now;
  updateProgressUI(info);
});

// Pro tip: use requestAnimationFrame for smooth UI
let animationId: number | null = null;
onAudioProgress(0, (info) => {
  if (animationId) return; // Skip if update pending
  
  animationId = requestAnimationFrame(() => {
    updateProgressBar(info.progress);
    updateTimeDisplay(info.currentTime, info.duration);
    animationId = null;
  });
});
```


## offAudioProgress

Remove all progress event listeners from a channel.

### Syntax

```typescript
offAudioProgress(channelNumber?: number = 0): void
```

### Examples

```typescript
import { onAudioProgress, offAudioProgress } from 'audio-channel-queue';

// Setup progress listener
onAudioProgress(0, (info) => {
  console.log(`Progress: ${Math.round(info.progress * 100)}%`);
});

// Remove progress listener from channel 0 (using default fallback)
offAudioProgress(); // Equivalent to offAudioProgress(0)

// Remove progress listener from channel 1 (must be explicit)
offAudioProgress(1);
```

## onQueueChange

Listen for changes to the audio queue.

### Syntax

```typescript
onQueueChange(channelNumber: number, callback: (snapshot: QueueSnapshot) => void): void
```

### QueueSnapshot Properties

```typescript
interface QueueSnapshot {
  channelNumber: number; // Channel number this snapshot represents
  currentIndex: number;  // Zero-based index of the currently playing item
  isPaused: boolean;     // Whether the current audio is paused
  items: QueueItem[];    // Array of audio items in the queue with their metadata
  totalItems: number;    // Total number of items in the queue
  volume: number;        // Current volume level for the channel (0-1)
}

interface QueueItem {
  duration: number;            // Total audio duration in milliseconds
  fileName: string;            // Extracted filename from the source URL
  isCurrentlyPlaying: boolean; // Whether this item is currently playing
  isLooping: boolean;          // Whether this item is set to loop
  src: string;                 // Audio file source URL
  volume: number;              // Volume level for this item (0-1)
}
```

### Examples

```typescript
import { onQueueChange, queueAudio, removeQueuedItem } from 'audio-channel-queue';

// Basic queue monitoring
onQueueChange(0, (snapshot) => {
  console.log(`Queue has ${snapshot.totalItems} items`);
  const currentItem = snapshot.items.find(item => item.isCurrentlyPlaying);
  console.log('Currently playing:', currentItem?.fileName || 'Nothing');
});

// Update queue display
onQueueChange(0, (snapshot) => {
  updateQueueUI(snapshot.items);
});
```

## offQueueChange

Removes all queue change event listeners for a specific channel.

### Syntax

```typescript
offQueueChange(channelNumber: number): void
```

### Examples

```typescript
import { onQueueChange, offQueueChange } from 'audio-channel-queue';

// Set up queue monitoring
onQueueChange(0, (snapshot) => {
  console.log(`Queue updated: ${snapshot.totalItems} items`);
});

// Later, stop monitoring
offQueueChange(0);

// Best practice: temporary queue monitoring
async function waitForQueueEmpty(channel: number): Promise<void> {
  return new Promise((resolve) => {
    const checkQueue = (snapshot: QueueSnapshot) => {
      if (snapshot.totalItems === 0) {
        offQueueChange(channel); // Clean up listener
        resolve();
      }
    };
    
    onQueueChange(channel, checkQueue);
  });
}
```

## Best Practices for Event Cleanup

### 1. Always Clean Up Event Listeners

```typescript
import { 
  onAudioStart,
  onAudioComplete,
  onAudioProgress,
  offAudioStart,
  offAudioComplete,
  offAudioProgress 
} from 'audio-channel-queue';

// React example
function AudioPlayer({ channel }: { channel: number }) {
  useEffect(() => {
    // Set up listeners
    onAudioStart(channel, handleStart);
    onAudioComplete(channel, handleComplete);
    onAudioProgress(channel, handleProgress);
    
    // Clean up on unmount
    return () => {
      offAudioStart(channel);
      offAudioComplete(channel);
      offAudioProgress(channel);
    };
  }, [channel]);
  
  // ... component implementation
}

// Vue 3 example
export default {
  setup() {
    const channel = ref(0);
    
    onMounted(() => {
      onAudioStart(channel.value, handleStart);
      onAudioProgress(channel.value, handleProgress);
    });
    
    onUnmounted(() => {
      offAudioStart(channel.value);
      offAudioProgress(channel.value);
    });
  }
}
```

### 2. Create Cleanup Utilities

```typescript
class ChannelManager {
  private activeChannels = new Set<number>();
  
  initializeChannel(channel: number) {
    if (this.activeChannels.has(channel)) {
      this.cleanupChannel(channel);
    }
    
    // Set up all listeners
    onAudioStart(channel, (info) => this.handleStart(channel, info));
    onAudioComplete(channel, (info) => this.handleComplete(channel, info));
    onAudioPause(channel, (channelNumber, info) => this.handlePause(channelNumber, info));
    onAudioResume(channel, (channelNumber, info) => this.handleResume(channelNumber, info));
    onQueueChange(channel, (snapshot) => this.handleQueueChange(channel, snapshot));
    
    this.activeChannels.add(channel);
  }
  
  cleanupChannel(channel: number) {
    offAudioStart(channel);
    offAudioComplete(channel);
    offAudioPause(channel);
    offAudioResume(channel);
    offAudioProgress(channel);
    offQueueChange(channel);
    
    this.activeChannels.delete(channel);
  }
  
  cleanupAll() {
    for (const channel of this.activeChannels) {
      this.cleanupChannel(channel);
    }
  }
  
  private handleStart(channel: number, info: AudioStartInfo) {
    // Handle start event
  }
  
  private handleComplete(channel: number, info: AudioCompleteInfo) {
    // Handle complete event
  }
  
  private handlePause(channelNumber: number, info: AudioInfo) {
    // Handle pause event
  }
  
  private handleResume(channelNumber: number, info: AudioInfo) {
    // Handle resume event
  }
  
  private handleQueueChange(channel: number, snapshot: QueueSnapshot) {
    // Handle queue change event
  }
}
```

### 3. Prevent Memory Leaks

```typescript
// Bad: Creates memory leak
function setupListeners() {
  // This creates a new function each time, previous listeners never removed
  onAudioProgress(0, (info) => {
    console.log(info.progress);
  });
}

// Good: Proper cleanup
let progressHandler: ((info: AudioInfo) => void) | null = null;

function setupListeners() {
  // Remove previous listener if exists
  if (progressHandler) {
    offAudioProgress(0);
  }
  
  // Create and store new handler
  progressHandler = (info) => {
    console.log(info.progress);
  };
  
  onAudioProgress(0, progressHandler);
}

function cleanup() {
  if (progressHandler) {
    offAudioProgress(0);
    progressHandler = null;
  }
}
```



## Real-world Usage


### Analytics and Tracking

```typescript
class AudioAnalytics {
  private sessionStart: number = Date.now();
  private playbackStats: Map<string, { count: number; completions: number }> = new Map();
  
  constructor() {
    this.setupAnalytics();
  }
  
  private setupAnalytics(): void {
    onAudioStart(0, (info) => {
      this.trackAudioStart(info);
    });
    
    onAudioComplete(0, (info) => {
      this.trackAudioComplete(info);
    });
    
    onAudioProgress(0, (info) => {
      this.trackProgress(info);
    });
  }
  
  private trackAudioStart(info: AudioStartInfo): void {
    console.log(`📊 Analytics: Started ${info.fileName}`);
    
    // Initialize or increment play count
    const stats = this.playbackStats.get(info.fileName) || { count: 0, completions: 0 };
    stats.count++;
    this.playbackStats.set(info.fileName, stats);
  }
  
  private trackAudioComplete(info: AudioCompleteInfo): void {
    console.log(`📊 Analytics: Completed ${info.fileName}`);
    
    // Update completion stats
    const stats = this.playbackStats.get(info.fileName);
    if (stats) {
      stats.completions = (stats.completions || 0) + 1;
      this.playbackStats.set(info.fileName, stats);
    }
    
    // Track remaining queue
    console.log(`📊 ${info.fileName} completed. ${info.remainingInQueue} items remaining in queue.`);
  }
  
  private trackProgress(info: AudioInfo): void {
    // Track milestone progress (only log once per milestone)
    const milestones = [0.25, 0.5, 0.75];
    for (const milestone of milestones) {
      if (info.progress >= milestone && info.progress < milestone + 0.01) {
        console.log(`📊 Analytics: ${info.fileName} reached ${milestone * 100}%`);
      }
    }
  }
  
  destroy(): void {
    // Clean up all analytics listeners
    offAudioStart(0);
    offAudioComplete(0);
    offAudioProgress(0);
  }
  
  getSessionReport(): object {
    const sessionDuration = Date.now() - this.sessionStart;
    const totalTracks = this.playbackStats.size;
    const totalPlaybacks = Array.from(this.playbackStats.values()).reduce((sum, stat) => sum + stat.count, 0);
    
    return {
      sessionDuration,
      totalTracks,
      totalPlaybacks,
      playbackStats: Object.fromEntries(this.playbackStats)
    };
  }
}
```

## Next Steps

Now that you understand event listeners, explore:

- **[Advanced Queue Manipulation](../advanced/advanced-queue-manipulation.md)** - Precise queue control and monitoring
- **[Audio Information](./audio-information.md)** - Get real-time audio data
- **[Queue Management](./queue-management.md)** - Control audio queues
- **[Volume Control](./volume-control.md)** - Manage audio levels
- **[Examples](../getting-started/basic-usage)** - Real-world event handling patterns 