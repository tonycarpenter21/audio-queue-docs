# Audio Information

Retrieve real-time information about audio playback, queue status, and channel states.

## getCurrentAudioInfo

Get detailed information about the currently playing audio on a specific channel.

### Syntax

```typescript
getCurrentAudioInfo(channelNumber?: number): AudioInfo | null
```

### Parameters

- `channelNumber` (number, optional): The channel number to query (defaults to 0)

### Returns

- `AudioInfo | null`: Information about current audio, or `null` if nothing is playing

### AudioInfo Properties

```typescript
interface AudioInfo {
  audioElement: HTMLAudioElement;
  currentTime: number;
  duration: number;
  fileName: string;
  isLooping: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  volume: number;
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
  console.log(`Progress: ${audioInfo.currentTime}/${audioInfo.duration}ms`);
  console.log(`Volume: ${audioInfo.volume}`);
  console.log(`Paused: ${audioInfo.isPaused}`);
}

// For channel 0 (default), you can omit the channel number
const info = getCurrentAudioInfo(); // Same as getCurrentAudioInfo(0)
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
            <span class="status">${audioInfo.isPaused ? '⏸️ Paused' : '▶️ Playing'}</span>
            ${audioInfo.isLooping ? '<span class="loop">🔁 Loop</span>' : ''}
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
getAllChannelsInfo(): { [channelNumber: number]: AudioInfo | null }
```

### Returns

- `Object`: Map of channel numbers to their current audio information

### Examples

```typescript
import { getAllChannelsInfo, queueAudio } from 'audio-channel-queue';

// Start audio on multiple channels
await queueAudio('/audio/music.mp3', 0);
await queueAudio('/audio/sfx.wav', 1);

// Get information for all channels
const allChannels = getAllChannelsInfo();

console.log('All Channel Information:');
Object.entries(allChannels).forEach(([channel, info]) => {
  if (info) {
    console.log(`Channel ${channel}: Playing ${info.fileName}`);
    console.log(`  Progress: ${Math.round((info.currentTime / info.duration) * 100)}%`);
    console.log(`  Volume: ${Math.round(info.volume * 100)}%`);
    console.log(`  Status: ${info.isPaused ? 'Paused' : 'Playing'}`);
  } else {
    console.log(`Channel ${channel}: No audio`);
  }
});
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
        const status = channelInfo.isPaused ? '⏸️ Paused' : '▶️ Playing';
        
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
getQueueSnapshot(channelNumber?: number): QueueSnapshot
```

### Parameters

- `channelNumber` (number, optional): The channel number to query (defaults to 0)

### Returns

- `QueueSnapshot`: Complete queue information

### QueueSnapshot Properties

```typescript
interface QueueSnapshot {
  items: QueueItem[];
  totalItems: number;
  currentlyPlaying: string | null;
  isChannelActive: boolean;
}

interface QueueItem {
  fileName: string;
  duration: number;
  isCurrentlyPlaying: boolean;
  position: number;
}
```

### Examples

```typescript
import { getQueueSnapshot, queueAudio } from 'audio-channel-queue';

// Queue multiple audio files
await queueAudio('/audio/track1.mp3');
await queueAudio('/audio/track2.mp3');
await queueAudio('/audio/track3.mp3');

// Get queue snapshot (using default channel 0)
const snapshot = getQueueSnapshot();

console.log(`Total items: ${snapshot.totalItems}`);
console.log(`Currently playing: ${snapshot.currentlyPlaying}`);
console.log(`Channel active: ${snapshot.isChannelActive}`);

snapshot.items.forEach((item, index) => {
  const status = item.isCurrentlyPlaying ? '▶️ Playing' : `#${item.position}`;
  console.log(`${status}: ${item.fileName} (${item.duration}ms)`);
});
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

  private updatePlaylistDisplay(snapshot: QueueSnapshot): void {
    if (!this.playlistElement) return;

    if (snapshot.totalItems === 0) {
      this.playlistElement.innerHTML = '<div class="no-playlist">No songs in queue</div>';
      return;
    }

    let playlistHTML = '<h3>Current Playlist</h3><ul class="playlist-items">';
    
    snapshot.items.forEach((item) => {
      const statusIcon = item.isCurrentlyPlaying ? '▶️' : '⏳';
      const itemClass = item.isCurrentlyPlaying ? 'playing' : 'queued';
      const duration = Math.round(item.duration / 1000);
      
      playlistHTML += `
        <li class="playlist-item ${itemClass}">
          <span class="status">${statusIcon}</span>
          <span class="position">${item.position}.</span>
          <span class="filename">${item.fileName}</span>
          <span class="duration">${duration}s</span>
        </li>
      `;
    });
    
    playlistHTML += '</ul>';
    this.playlistElement.innerHTML = playlistHTML;
  }

  private updateStats(snapshot: QueueSnapshot): void {
    if (!this.statsElement) return;

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
          <span class="value">${snapshot.isChannelActive ? '🟢 Active' : '🔴 Inactive'}</span>
        </div>
        <div class="stat">
          <span class="label">Now Playing:</span>
          <span class="value">${snapshot.currentlyPlaying || 'None'}</span>
        </div>
      </div>
    `;
  }
}
```

### Queue Analysis

```typescript
class QueueAnalyzer {
  analyzeQueue(channel: number = 0): void {
    const snapshot = channel === 0 ? getQueueSnapshot() : getQueueSnapshot(channel);
    
    console.log(`\n📊 Queue Analysis for Channel ${channel}:`);
    console.log(`   Total Items: ${snapshot.totalItems}`);
    console.log(`   Currently Playing: ${snapshot.currentlyPlaying || 'Nothing'}`);
    console.log(`   Channel Active: ${snapshot.isChannelActive ? 'Yes' : 'No'}`);

    if (snapshot.totalItems === 0) {
      console.log('   Status: ✅ Queue is empty and ready for new audio');
      return;
    }

    const totalDuration = snapshot.items.reduce((sum, item) => sum + item.duration, 0);
    const avgDuration = totalDuration / snapshot.items.length;

    console.log(`   Total Duration: ${Math.round(totalDuration / 1000)} seconds`);
    console.log(`   Average Duration: ${Math.round(avgDuration / 1000)} seconds`);

    // Queue health assessment
    if (snapshot.totalItems > 10) {
      console.log('   ⚠️  Warning: Large queue detected - may impact performance');
    } else if (snapshot.totalItems > 5) {
      console.log('   📈 Queue is moderately full');
    } else {
      console.log('   ✅ Queue size is optimal');
    }

    // Show queue items
    console.log('\n   Queue Items:');
    snapshot.items.forEach((item) => {
      const status = item.isCurrentlyPlaying ? '🔊 Playing' : `#${item.position} Queued`;
      const duration = Math.round(item.duration / 1000);
      console.log(`     ${status}: ${item.fileName} (${duration}s)`);
    });
  }

  monitorQueueHealth(): void {
    setInterval(() => {
      // Monitor default channel and channels 1-3
      for (let channel = 0; channel < 4; channel++) {
        const snapshot = channel === 0 ? getQueueSnapshot() : getQueueSnapshot(channel);
        
        if (snapshot.totalItems > 15) {
          console.warn(`🚨 Channel ${channel} queue overloaded: ${snapshot.totalItems} items`);
        }
      }
    }, 5000); // Check every 5 seconds
  }
}
```

### Performance Monitoring

```typescript
class AudioPerformanceMonitor {
  private metrics = {
    memoryUsage: 0,
    activeTracks: 0,
    queueSizes: {} as { [channel: number]: number },
    lastUpdate: Date.now()
  };

  startMonitoring(): void {
    setInterval(() => {
      this.updateMetrics();
      this.checkPerformance();
    }, 5000); // Check every 5 seconds
  }

  private updateMetrics(): void {
    // Get memory usage (if available)
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    // Count active tracks across all channels
    const allChannels = getAllChannelsInfo();
    this.metrics.activeTracks = Object.values(allChannels)
      .filter(info => info !== null).length;

    // Get queue sizes
    for (let i = 0; i < 8; i++) { // Check 8 channels
      const snapshot = i === 0 ? getQueueSnapshot() : getQueueSnapshot(i);
      this.metrics.queueSizes[i] = snapshot.totalItems;
    }

    this.metrics.lastUpdate = Date.now();
  }

  private checkPerformance(): void {
    // Warn if too many active tracks
    if (this.metrics.activeTracks > 10) {
      console.warn(`Performance Warning: ${this.metrics.activeTracks} active tracks`);
    }

    // Warn if queue sizes are getting large
    const totalQueued = Object.values(this.metrics.queueSizes)
      .reduce((sum, size) => sum + size, 0);
      
    if (totalQueued > 50) {
      console.warn(`Performance Warning: ${totalQueued} total queued items`);
    }

    // Memory warning (if available)
    if (this.metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
      console.warn(`Memory Warning: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB used`);
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
} 