# Event Listeners

Listen for audio events to create responsive user interfaces and track playback behavior.

## onAudioStart

Listen for when audio begins playing on a specific channel.

### Syntax

```typescript
onAudioStart(channelNumber: number, callback: (info: AudioStartInfo) => void): void
```

### Parameters

- `channelNumber` (number): The channel number to monitor
- `callback` (function): Function called when audio starts
  - `info` (AudioStartInfo): Information about the started audio

### AudioStartInfo Properties

```typescript
interface AudioStartInfo {
  audioElement: HTMLAudioElement;
  currentTime: number;
  duration: number;
  fileName: string;
  isLooping: boolean;
  volume: number;
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
```

### Real-world Usage

```typescript
class AudioUI {
  constructor() {
    this.setupAudioEventListeners();
  }

  private setupAudioEventListeners(): void {
    onAudioStart(0, (info) => {
      this.showPlayingState(info);
      this.startProgressUpdates();
    });
  }

  private showPlayingState(info: AudioStartInfo): void {
    const playButton = document.getElementById('play-pause-btn');
    const nowPlaying = document.getElementById('now-playing');
    
    if (playButton) {
      playButton.textContent = '⏸️ Pause';
      playButton.onclick = () => pauseChannel(0);
    }
    
    if (nowPlaying) {
      nowPlaying.innerHTML = `
        <div class="track-info">
          <div class="track-name">${info.fileName}</div>
          <div class="track-duration">${this.formatDuration(info.duration)}</div>
        </div>
      `;
    }
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private startProgressUpdates(): void {
    // Start interval to update progress bar
    this.progressInterval = setInterval(() => {
      const info = getCurrentAudioInfo(0);
      if (info) {
        this.updateProgressBar(info.currentTime, info.duration);
      }
    }, 100);
  }
}
```

## onAudioComplete

Listen for when audio finishes playing (either naturally or when interrupted).

### Syntax

```typescript
onAudioComplete(channelNumber: number, callback: (info: AudioCompleteInfo) => void): void
```

### Parameters

- `channelNumber` (number): The channel number to monitor  
- `callback` (function): Function called when audio completes
  - `info` (AudioCompleteInfo): Information about the completed audio

### AudioCompleteInfo Properties

```typescript
interface AudioCompleteInfo {
  fileName: string;
  playbackDuration: number;
  remainingInQueue: number;
  wasInterrupted: boolean;
}
```

### Examples

```typescript
import { onAudioComplete, queueAudio } from 'audio-channel-queue';

// Track completion stats
onAudioComplete(0, (info) => {
  console.log(`Completed: ${info.fileName}`);
  console.log(`Played for: ${info.playbackDuration}ms`);
  console.log(`Interrupted: ${info.wasInterrupted}`);
  console.log(`Items left: ${info.remainingInQueue}`);
});

// Auto-queue next playlist item
onAudioComplete(0, (info) => {
  if (info.remainingInQueue === 0) {
    loadNextPlaylist();
  }
});
```

## onAudioPause

Listen for when audio is paused on a specific channel.

### Syntax

```typescript
onAudioPause(channelNumber: number, callback: () => void): void
```

### Parameters

- `channelNumber` (number): The channel number to monitor
- `callback` (function): Function called when audio is paused

### Examples

```typescript
import { onAudioPause, pauseChannel } from 'audio-channel-queue';

// Update UI when audio is paused
onAudioPause(0, () => {
  console.log('Music paused');
  updatePlayButtonState('play');
  showPausedOverlay();
});

// Track pause events for analytics
onAudioPause(0, () => {
  analytics.track('audio_paused', {
    channel: 0,
    timestamp: Date.now()
  });
});

// Pause the audio to trigger the event
pauseChannel(0);
```

### Real-world Usage

```typescript
class MediaPlayer {
  constructor() {
    this.setupPauseHandling();
  }

  private setupPauseHandling(): void {
    onAudioPause(0, () => {
      this.onAudioPaused();
    });
  }

  private onAudioPaused(): void {
    // Update play/pause button
    const playButton = document.getElementById('play-pause-btn');
    if (playButton) {
      playButton.textContent = '▶️ Play';
      playButton.onclick = () => resumeChannel(0);
    }

    // Show paused state in UI
    const playerContainer = document.getElementById('player');
    if (playerContainer) {
      playerContainer.classList.add('paused');
    }

    // Pause any visual effects
    this.stopVisualization();
    
    // Save current position for resume
    const audioInfo = getCurrentAudioInfo(0);
    if (audioInfo) {
      this.savedPosition = audioInfo.currentTime;
    }
  }
}
```

## onAudioResume

Listen for when audio is resumed on a specific channel.

### Syntax

```typescript
onAudioResume(channelNumber: number, callback: () => void): void
```

### Parameters

- `channelNumber` (number): The channel number to monitor
- `callback` (function): Function called when audio is resumed

### Examples

```typescript
import { onAudioResume, resumeChannel } from 'audio-channel-queue';

// Update UI when audio resumes
onAudioResume(0, () => {
  console.log('Music resumed');
  updatePlayButtonState('pause');
  hidePausedOverlay();
});

// Track resume events
onAudioResume(0, () => {
  analytics.track('audio_resumed', {
    channel: 0,
    timestamp: Date.now()
  });
});

// Resume the audio to trigger the event
resumeChannel(0);
```

### Real-world Usage

```typescript
class MediaPlayer {
  constructor() {
    this.setupResumeHandling();
  }

  private setupResumeHandling(): void {
    onAudioResume(0, () => {
      this.onAudioResumed();
    });
  }

  private onAudioResumed(): void {
    // Update play/pause button
    const playButton = document.getElementById('play-pause-btn');
    if (playButton) {
      playButton.textContent = '⏸️ Pause';
      playButton.onclick = () => pauseChannel(0);
    }

    // Remove paused state from UI
    const playerContainer = document.getElementById('player');
    if (playerContainer) {
      playerContainer.classList.remove('paused');
    }

    // Resume visual effects
    this.startVisualization();
    
    // Continue progress tracking
    this.resumeProgressTracking();
  }
}
```

## onAudioProgress

Listen for real-time progress updates during audio playback.

### Syntax

```typescript
onAudioProgress(channelNumber: number, callback: (info: AudioProgressInfo) => void): void
```

### Parameters

- `channelNumber` (number): The channel number to monitor
- `callback` (function): Function called during playback progress
  - `info` (AudioProgressInfo): Current progress information

### AudioProgressInfo Properties

```typescript
interface AudioProgressInfo {
  currentTime: number;
  duration: number;
  fileName: string;
  progress: number;
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
```

### Real-world Usage

```typescript
class ProgressTracker {
  constructor() {
    this.setupProgressTracking();
  }

  private setupProgressTracking(): void {
    onAudioProgress(0, (info) => {
      this.updateProgress(info);
      this.checkMilestones(info);
    });
  }

  private updateProgress(info: AudioProgressInfo): void {
    // Update progress bar
    const progressBar = document.getElementById('progress-bar') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${info.progress * 100}%`;
    }

    // Update time display
    this.updateTimeDisplay(info.currentTime, info.duration);
  }

  private updateTimeDisplay(current: number, total: number): void {
    const currentDisplay = document.getElementById('current-time');
    const totalDisplay = document.getElementById('total-time');
    
    if (currentDisplay) {
      currentDisplay.textContent = this.formatTime(current);
    }
    
    if (totalDisplay) {
      totalDisplay.textContent = this.formatTime(total);
    }
  }

  private formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private checkForBookmarks(info: AudioProgressInfo): void {
    // Trigger events at specific timestamps
    const currentSeconds = Math.floor(info.currentTime / 1000);
    
    if (currentSeconds === 30) {
      this.triggerEvent('30-second-mark');
    } else if (info.progress >= 0.5 && info.progress < 0.51) {
      this.triggerEvent('halfway-point');
    }
  }

  private triggerEvent(eventName: string): void {
    console.log(`Event triggered: ${eventName}`);
    // Dispatch custom events, show notifications, etc.
  }
}
```

## onQueueChange

Listen for changes to the audio queue.

### Syntax

```typescript
onQueueChange(channelNumber: number, callback: (snapshot: QueueSnapshot) => void): void
```

### Parameters

- `channelNumber` (number): The channel number to monitor
- `callback` (function): Function called when queue changes
  - `snapshot` (QueueSnapshot): Current state of the queue

### QueueSnapshot Properties

```typescript
interface QueueSnapshot {
  items: QueueItem[];
  totalItems: number;
  currentlyPlaying: string | null;
}

interface QueueItem {
  fileName: string;
  duration: number;
  isCurrentlyPlaying: boolean;
}
```

### Examples

```typescript
import { onQueueChange, queueAudio } from 'audio-channel-queue';

// Basic queue monitoring
onQueueChange(0, (snapshot) => {
  console.log(`Queue has ${snapshot.totalItems} items`);
  console.log('Currently playing:', snapshot.currentlyPlaying);
});

// Update queue display
onQueueChange(0, (snapshot) => {
  updateQueueUI(snapshot.items);
});

function updateQueueUI(items: QueueItem[]): void {
  const queueList = document.getElementById('queue-list');
  if (!queueList) return;

  queueList.innerHTML = items.map((item, index) => {
    const status = item.isCurrentlyPlaying ? '▶️ Playing' : `#${index + 1}`;
    return `<li class="queue-item">${status}: ${item.fileName}</li>`;
  }).join('');
}
```

### Real-world Usage

```typescript
class PlaylistManager {
  constructor() {
    this.setupQueueMonitoring();
  }

  private setupQueueMonitoring(): void {
    onQueueChange(0, (snapshot) => {
      this.updatePlaylistDisplay(snapshot);
      this.updateQueueStats(snapshot);
    });
  }

  private updatePlaylistDisplay(snapshot: QueueSnapshot): void {
    const playlistContainer = document.getElementById('playlist');
    if (!playlistContainer) return;

    if (snapshot.totalItems === 0) {
      playlistContainer.innerHTML = '<div class="empty-playlist">No songs in queue</div>';
      return;
    }

    const playlistHTML = snapshot.items.map((item, index) => {
      const isPlaying = item.isCurrentlyPlaying;
      const duration = this.formatDuration(item.duration);
      
      return `
        <div class="playlist-item ${isPlaying ? 'playing' : ''}">
          <div class="track-number">${isPlaying ? '▶️' : index + 1}</div>
          <div class="track-info">
            <div class="track-name">${item.fileName}</div>
            <div class="track-duration">${duration}</div>
          </div>
          ${!isPlaying ? '<button class="remove-btn" onclick="removeTrack(' + index + ')">✖️</button>' : ''}
        </div>
      `;
    }).join('');

    playlistContainer.innerHTML = playlistHTML;
  }

  private updateQueueStats(snapshot: QueueSnapshot): void {
    const statsElement = document.getElementById('queue-stats');
    if (statsElement) {
      const totalDuration = snapshot.items.reduce((sum, item) => sum + item.duration, 0);
      statsElement.innerHTML = `
        <div class="stat">
          <span class="label">Tracks:</span>
          <span class="value">${snapshot.totalItems}</span>
        </div>
        <div class="stat">
          <span class="label">Total Time:</span>
          <span class="value">${this.formatDuration(totalDuration)}</span>
        </div>
      `;
    }
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
```

## Error Handling with Events

While there isn't a dedicated `onAudioError` event yet, you can implement error handling using the existing events:

```typescript
class AudioErrorHandler {
  private errorCount: number = 0;
  private maxErrors: number = 3;

  constructor() {
    this.setupErrorDetection();
  }

  private setupErrorDetection(): void {
    let expectingStart = false;
    let startTimeout: NodeJS.Timeout;

    // Detect failed starts
    onQueueChange(0, (snapshot) => {
      if (snapshot.totalItems > 0 && snapshot.currentlyPlaying) {
        expectingStart = true;
        
        // Clear any existing timeout
        if (startTimeout) clearTimeout(startTimeout);
        
        // Audio should start within 5 seconds
        startTimeout = setTimeout(() => {
          if (expectingStart) {
            this.handleError('Audio failed to start within timeout');
          }
        }, 5000);
      }
    });

    onAudioStart(0, () => {
      expectingStart = false;
      if (startTimeout) {
        clearTimeout(startTimeout);
      }
    });

    // Detect suspicious completions (very short playback)
    onAudioComplete(0, (info) => {
      if (info.playbackDuration < 1000 && !info.wasInterrupted) {
        this.handleError(`Suspicious completion: ${info.fileName} played for only ${info.playbackDuration}ms`);
      }
    });
  }

  private handleError(message: string): void {
    this.errorCount++;
    console.error(`Audio Error ${this.errorCount}: ${message}`);
    
    if (this.errorCount >= this.maxErrors) {
      console.error('Too many audio errors - audio system may be unstable');
      // Could disable audio system or show user notification
    }
  }
}
```

## Event Cleanup

Remember to clean up event listeners when no longer needed:

```typescript
import { offAudioStart, offAudioComplete, offQueueChange } from 'audio-channel-queue';

class AudioComponent {
  private startHandler = (info: AudioStartInfo) => {
    console.log(`Started: ${info.fileName}`);
  };

  constructor() {
    // Set up listeners
    onAudioStart(0, this.startHandler);
  }

  destroy(): void {
    // Clean up listeners
    offAudioStart(0, this.startHandler);
    // Note: Some cleanup functions may not exist yet - check package documentation
  }
}
```

## Analytics and Tracking

Use events to build comprehensive analytics:

```typescript
class AudioAnalytics {
  private sessionStart: number = Date.now();
  private playbackStats: Map<string, { count: number; totalDuration: number }> = new Map();
  
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
    const stats = this.playbackStats.get(info.fileName) || { count: 0, totalDuration: 0 };
    stats.count++;
    this.playbackStats.set(info.fileName, stats);
  }
  
  private trackAudioComplete(info: AudioCompleteInfo): void {
    console.log(`📊 Analytics: Completed ${info.fileName} (${info.playbackDuration}ms)`);
    
    // Update duration stats
    const stats = this.playbackStats.get(info.fileName);
    if (stats) {
      stats.totalDuration += info.playbackDuration;
      this.playbackStats.set(info.fileName, stats);
    }
    
    // Track completion rate
    if (!info.wasInterrupted) {
      console.log(`✅ ${info.fileName} played to completion`);
    } else {
      console.log(`⏹️ ${info.fileName} was interrupted`);
    }
  }
  
  private trackProgress(info: AudioProgressInfo): void {
    // Track milestone progress (only log once per milestone)
    const milestones = [0.25, 0.5, 0.75];
    for (const milestone of milestones) {
      if (info.progress >= milestone && info.progress < milestone + 0.01) {
        console.log(`📊 Analytics: ${info.fileName} reached ${milestone * 100}%`);
      }
    }
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

Now that you understand the event system, explore:

- **[Audio Information](./audio-information.md)** - Get real-time audio data
- **[Queue Management](./queue-management.md)** - Control audio queues
- **[Volume Control](./volume-control.md)** - Manage audio levels
- **[Examples](../getting-started/basic-usage)** - Real-world event handling patterns 