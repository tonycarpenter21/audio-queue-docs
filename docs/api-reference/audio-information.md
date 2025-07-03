# Audio Information

Retrieve real-time information about audio playback, queue status, and channel states.

## getCurrentAudioInfo

Get detailed information about the currently playing audio on a specific channel.

### Syntax

```typescript
getCurrentAudioInfo(channelNumber?: number = 0): AudioInfo | null
```

### Returns

- `AudioInfo | null`: Information about current audio, or `null` if nothing is playing

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
import { getCurrentAudioInfo, queueAudio } from 'audio-channel-queue';

// Start playing audio
await queueAudio('/audio/music.mp3');

// Get current audio information (using default channel 0)
const audioInfo = getCurrentAudioInfo();
if (audioInfo) {
  console.log(`Playing: ${audioInfo.fileName}`);
  console.log(`Progress: ${Math.round(audioInfo.progress * 100)}% (${audioInfo.currentTime}/${audioInfo.duration}ms)`);
  console.log(`Volume: ${audioInfo.volume}`);
  console.log(`Paused: ${audioInfo.isPaused}`);
  console.log(`Source: ${audioInfo.src}`);
}

// For channel 0 (default), you can omit the channel number
const info = getCurrentAudioInfo(); // Same as getCurrentAudioInfo(0)

// Best practice: guard against null returns
function safeGetAudioProgress(channel: number = 0): number {
  const info = getCurrentAudioInfo(channel);
  return info?.progress ?? 0; // Default to 0 if no audio
}

// Pro tip: use for responsive UI updates
function updateUI(): void {
  const info = getCurrentAudioInfo();
  if (info && !info.isPaused) {
    updateProgressBar(info.progress);
    requestAnimationFrame(updateUI); // Continue if playing
  }
}
requestAnimationFrame(updateUI);
```

### Real-world Usage

```typescript
class AudioStatusDisplay {
  private statusElement: HTMLElement | null = null;

  constructor() {
    this.statusElement = document.getElementById('audio-status');
    this.startStatusUpdates();
  }

  private startStatusUpdates(): void {
    setInterval(() => {
      this.updateStatus();
    }, 100); // Update every 100ms
  }

  private updateStatus(): void {
    const audioInfo = getCurrentAudioInfo(); // Using default channel 0
    
    if (audioInfo && this.statusElement) {
      const progress = (audioInfo.currentTime / audioInfo.duration) * 100;
      const timeDisplay = this.formatTime(audioInfo.currentTime);
      const totalTime = this.formatTime(audioInfo.duration);
      
      this.statusElement.innerHTML = `
        <div class="now-playing">
          <h3>Now Playing</h3>
          <div class="track-name">${audioInfo.fileName}</div>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%"></div>
            <div class="time-display">${timeDisplay} / ${totalTime}</div>
          </div>
          <div class="audio-controls">
            <span class="volume">Volume: ${Math.round(audioInfo.volume * 100)}%</span>
            <span class="status">${audioInfo.isPaused ? 'Paused' : 'Playing'}</span>
            ${audioInfo.isLooping ? '<span class="loop">Loop</span>' : ''}
          </div>
        </div>
      `;
    } else if (this.statusElement) {
      this.statusElement.innerHTML = '<div class="no-audio">No audio playing</div>';
    }
  }

  private formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
```

## getAllChannelsInfo

Get information about all active audio channels.

### Syntax

```typescript
getAllChannelsInfo(): (AudioInfo | null)[]
```

### Returns

- `(AudioInfo | null)[]`: Array of audio information objects (null for channels with no audio)

### Examples

```typescript
import { getAllChannelsInfo, queueAudio } from 'audio-channel-queue';

// Start audio on multiple channels
await queueAudio('/audio/music.mp3', 0);
await queueAudio('/audio/sfx.wav', 1);

// Get information for all channels
const allChannels = getAllChannelsInfo();

console.log('All Channel Information:');
allChannels.forEach((info, channel) => {
  if (info) {
    console.log(`Channel ${channel}: Playing ${info.fileName}`);
    console.log(`  Progress: ${Math.round((info.currentTime / info.duration) * 100)}%`);
    console.log(`  Volume: ${Math.round(info.volume * 100)}%`);
    console.log(`  Status: ${info.isPaused ? 'Paused' : 'Playing'}`);
  } else {
    console.log(`Channel ${channel}: No audio`);
  }
});

// Best practice: filter active channels only
function getActiveChannels(): number[] {
  const allChannels = getAllChannelsInfo();
  return allChannels
    .map((info, index) => ({ info, index }))
    .filter(({ info }) => info !== null && info.isPlaying)
    .map(({ index }) => index);
}

// Pro tip: monitor channel utilization
function getChannelUtilization(): { active: number; total: number } {
  const channels = getAllChannelsInfo();
  const active = channels.filter(info => info !== null).length;
  return { active, total: channels.length };
}
```

### Multi-Channel Dashboard

```typescript
class MultiChannelDashboard {
  private dashboardElement: HTMLElement | null = null;
  private updateInterval: number | null = null;

  constructor() {
    this.dashboardElement = document.getElementById('channel-dashboard');
    this.startDashboard();
  }

  private startDashboard(): void {
    this.updateInterval = setInterval(() => {
      this.updateDashboard();
    }, 500); // Update every 500ms
  }

  private updateDashboard(): void {
    const allChannels = getAllChannelsInfo();
    
    if (!this.dashboardElement) return;

    let dashboardHTML = '<h2>Audio Channel Dashboard</h2>';
    
    // Show channels 0-4
    for (let i = 0; i < 5; i++) {
      const channelInfo = allChannels[i];
      
      if (channelInfo) {
        const progress = Math.round((channelInfo.currentTime / channelInfo.duration) * 100);
        const volume = Math.round(channelInfo.volume * 100);
        const status = channelInfo.isPaused ? 'Paused' : 'Playing';
        
        dashboardHTML += `
          <div class="channel-info active">
            <h3>Channel ${i}</h3>
            <div class="track-name">${channelInfo.fileName}</div>
            <div class="progress-info">Progress: ${progress}%</div>
            <div class="volume-info">Volume: ${volume}%</div>
            <div class="status-info">${status}</div>
          </div>
        `;
      } else {
        dashboardHTML += `
          <div class="channel-info inactive">
            <h3>Channel ${i}</h3>
            <div class="no-audio">No audio playing</div>
          </div>
        `;
      }
    }
    
    this.dashboardElement.innerHTML = dashboardHTML;
  }

  private formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
```

## getQueueSnapshot

Get a complete snapshot of the current queue state for a specific channel.

### Syntax

```typescript
getQueueSnapshot(channelNumber?: number = 0): QueueSnapshot | null
```

### Returns

- `QueueSnapshot | null`: Complete queue information, or `null` if channel doesn't exist

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
import { getQueueSnapshot, queueAudio } from 'audio-channel-queue';

// Queue multiple audio files on channel 0
await queueAudio('/audio/track1.mp3');
await queueAudio('/audio/track2.mp3');
await queueAudio('/audio/track3.mp3');

// Get queue snapshot from channel 0 (using default fallback)
const snapshot = getQueueSnapshot(); // Same as getQueueSnapshot(0)

if (snapshot) {
  console.log(`Total items: ${snapshot.totalItems}`);
  console.log(`Current index: ${snapshot.currentIndex}`);
  console.log(`Is paused: ${snapshot.isPaused}`);

  snapshot.items.forEach((item, index) => {
    const status = item.isCurrentlyPlaying ? 'Playing' : `#${index}`;
    console.log(`${status}: ${item.fileName} (${item.duration}ms)`);
  });
}

// For other channels, you must specify the channel number
const channel1Snapshot = getQueueSnapshot(1);
const channel2Snapshot = getQueueSnapshot(2);

// Best practice: calculate remaining queue duration
function getRemainingQueueTime(channel: number = 0): number {
  const snapshot = getQueueSnapshot(channel);
  if (!snapshot) return 0;
  
  return snapshot.items
    .filter(item => !item.isCurrentlyPlaying)
    .reduce((total, item) => total + item.duration, 0);
}

// Pro tip: detect stalled queues
function isQueueStalled(channel: number = 0): boolean {
  const snapshot = getQueueSnapshot(channel);
  const audioInfo = getCurrentAudioInfo(channel);
  return snapshot ? snapshot.totalItems > 0 && !audioInfo && !snapshot.isPaused : false;
}
```

### Real-world Usage

```typescript
class PlaylistViewer {
  private playlistElement: HTMLElement | null = null;
  private statsElement: HTMLElement | null = null;

  constructor() {
    this.playlistElement = document.getElementById('playlist');
    this.statsElement = document.getElementById('playlist-stats');
    this.startPlaylistUpdates();
  }

  private startPlaylistUpdates(): void {
    setInterval(() => {
      this.updatePlaylist();
    }, 1000); // Update every second
  }

  private updatePlaylist(): void {
    const snapshot = getQueueSnapshot(); // Using default channel 0
    
    this.updatePlaylistDisplay(snapshot);
    this.updateStats(snapshot);
  }

  private updatePlaylistDisplay(snapshot: QueueSnapshot | null): void {
    if (!this.playlistElement) return;

    if (!snapshot || snapshot.totalItems === 0) {
      this.playlistElement.innerHTML = '<div class="no-playlist">No songs in queue</div>';
      return;
    }

    let playlistHTML = '<h3>Current Playlist</h3><ul class="playlist-items">';
    
    snapshot.items.forEach((item, index) => {
      const statusIcon = item.isCurrentlyPlaying ? '▶️' : '⏳';
      const itemClass = item.isCurrentlyPlaying ? 'playing' : 'queued';
      const duration = Math.round(item.duration / 1000);
      
      playlistHTML += `
        <li class="playlist-item ${itemClass}">
          <span class="status">${statusIcon}</span>
          <span class="position">${index + 1}.</span>
          <span class="filename">${item.fileName}</span>
          <span class="duration">${duration}s</span>
        </li>
      `;
    });
    
    playlistHTML += '</ul>';
    this.playlistElement.innerHTML = playlistHTML;
  }

  private updateStats(snapshot: QueueSnapshot | null): void {
    if (!this.statsElement) return;

    if (!snapshot) {
      this.statsElement.innerHTML = '<div class="no-stats">No queue data</div>';
      return;
    }

    const totalDuration = snapshot.items.reduce((sum, item) => sum + item.duration, 0);
    const totalMinutes = Math.round(totalDuration / 1000 / 60);
    
    this.statsElement.innerHTML = `
      <div class="playlist-stats">
        <div class="stat">
          <span class="label">Total Tracks:</span>
          <span class="value">${snapshot.totalItems}</span>
        </div>
        <div class="stat">
          <span class="label">Total Duration:</span>
          <span class="value">${totalMinutes} minutes</span>
        </div>
        <div class="stat">
          <span class="label">Channel Status:</span>
          <span class="value">${snapshot.totalItems > 0 && !snapshot.isPaused ? 'Active' : 'Inactive'}</span>
        </div>
        <div class="stat">
          <span class="label">Now Playing:</span>
          <span class="value">${snapshot.items.find(item => item.isCurrentlyPlaying)?.fileName || 'None'}</span>
        </div>
      </div>
    `;
  }
}
```

## 🔗 Related Functions

- **[Advanced Queue Manipulation](../advanced/advanced-queue-manipulation)** - Remove, reorder, and swap queue items
- **[Queue Management](./queue-management)** - Basic queue operations
- **[Event Listeners](./event-listeners)** - Monitor audio and queue events
- **[Types & Interfaces](./types-interfaces)** - TypeScript interface definitions 