# Queue System

Understanding how audio queuing works within channels and how to manage playback order and timing.

## What is the Queue System?

Each audio channel maintains its own **First-In-First-Out (FIFO)** queue that automatically manages audio playback order. When you queue audio, it gets added to the end of the channel's queue and plays when it's turn comes.

```typescript
import { queueAudio, queueAudioPriority, getQueueSnapshot } from 'audio-channel-queue';

// Queue multiple audio files - they play in order (using default channel 0)
await queueAudio('./audio/track1.mp3');
await queueAudio('./audio/track2.mp3');
await queueAudio('./audio/track3.mp3');

// Check the queue
const snapshot = getQueueSnapshot();
console.log(`Queue has ${snapshot.totalItems} items`);
// Will play: track1 → track2 → track3
```

## Queue Behavior

### Standard Queuing

With `queueAudio()`, files are added to the end of the queue:

```typescript
import { queueAudio, onAudioStart } from 'audio-channel-queue';

// Setup logging to see the order
onAudioStart(0, (info) => {
  console.log(`Now playing: ${info.fileName}`);
});

// Queue several tracks (using default channel 0)
await queueAudio('./music/intro.mp3');        // Plays immediately
await queueAudio('./music/main-theme.mp3');   // Plays after intro
await queueAudio('./music/outro.mp3');        // Plays after main-theme

// Order: intro → main-theme → outro
```

### Priority Queuing

With `queueAudioPriority()`, files interrupt current playback and jump to the front:

```typescript
import { queueAudio, queueAudioPriority } from 'audio-channel-queue';

// Start with background music (using default channel 0)
await queueAudio('./music/background.mp3');

// Urgent announcement interrupts immediately
await queueAudioPriority('./voice/emergency-alert.mp3');

// Background music will resume after the alert
```

### Mixed Queuing Patterns

```typescript
// Complex queuing scenario
async function demonstrateQueueing(): Promise<void> {
  // 1. Start background music (using default channel 0)
  await queueAudio('./music/calm-background.mp3', 0, { loop: true });
  
  // 2. Queue some planned content
  await queueAudio('./voice/welcome.mp3');
  await queueAudio('./voice/instructions.mp3');
  
  // 3. Emergency interruption
  await queueAudioPriority('./alerts/urgent.mp3');
  
  // 4. More content after emergency
  await queueAudio('./voice/continue.mp3');
  
  // Final order: urgent → welcome → instructions → continue
  // (background music was stopped by the first priority call)
}
```

## Queue States and Information

### Queue Snapshots

Get complete information about a channel's queue:

```typescript
import { getQueueSnapshot, QueueSnapshot, QueueItem } from 'audio-channel-queue';

function analyzeQueue(channel: number): void {
  const snapshot: QueueSnapshot = channel === 0 ? getQueueSnapshot() : getQueueSnapshot(channel);
  
  console.log(`Channel ${channel} Queue Analysis:`);
  console.log(`- Total items: ${snapshot.totalItems}`);
  console.log(`- Currently playing: ${snapshot.currentlyPlaying || 'Nothing'}`);
  console.log(`- Channel active: ${snapshot.isChannelActive}`);
  
  if (snapshot.items.length > 0) {
    console.log('\nQueue Items:');
    snapshot.items.forEach((item: QueueItem, index: number) => {
      const status = item.isCurrentlyPlaying ? '🔊 Playing' : '⏳ Queued';
      const duration = Math.round(item.duration / 1000);
      console.log(`  ${item.position}. ${status} - ${item.fileName} (${duration}s)`);
    });
  }
}

// Use it - examples with both default and explicit channel
analyzeQueue(0);  // Can use default: getQueueSnapshot()
analyzeQueue(1);  // Must be explicit: getQueueSnapshot(1)
```

### Real-time Queue Monitoring

```typescript
import { onQueueChange } from 'audio-channel-queue';

class QueueMonitor {
  setupQueueTracking(channel: number): void {
    onQueueChange(channel, (snapshot) => {
      console.log(`Queue changed on channel ${channel}:`);
      console.log(`- Items: ${snapshot.totalItems}`);
      console.log(`- Playing: ${snapshot.currentlyPlaying}`);
      
      // React to queue events
      if (snapshot.totalItems === 0) {
        this.onQueueEmpty(channel);
      } else if (snapshot.totalItems > 10) {
        this.onQueueOverloaded(channel);
      }
    });
  }
  
  onQueueEmpty(channel: number): void {
    console.log(`Channel ${channel} queue is empty - maybe start background music?`);
  }
  
  onQueueOverloaded(channel: number): void {
    console.log(`Channel ${channel} queue is getting long - consider optimization`);
  }
}
```

## Queue Management Patterns

### Playlist Management

```typescript
class PlaylistManager {
  private playlist: string[] = [];
  private currentIndex: number = 0;
  private channel: number = 0;
  
  constructor(channel: number = 0) {
    this.channel = channel;
    this.setupEventHandlers();
  }
  
  loadPlaylist(audioFiles: string[]): void {
    this.playlist = [...audioFiles];
    this.currentIndex = 0;
  }
  
  async startPlaylist(): Promise<void> {
    if (this.playlist.length === 0) return;
    
    // Queue all tracks
    for (const track of this.playlist) {
      await queueAudio(track, this.channel);
    }
  }
  
  async skipToNext(): Promise<void> {
    // Stop current and play next
    stopCurrentAudioInChannel(this.channel);
    
    this.currentIndex++;
    if (this.currentIndex < this.playlist.length) {
      await queueAudioPriority(this.playlist[this.currentIndex], this.channel);
    }
  }
  
  async skipToPrevious(): Promise<void> {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    stopCurrentAudioInChannel(this.channel);
    await queueAudioPriority(this.playlist[this.currentIndex], this.channel);
  }
  
  private setupEventHandlers(): void {
    onAudioComplete(this.channel, (info) => {
      console.log(`Completed: ${info.fileName}`);
      
      // Auto-advance playlist
      if (info.remainingInQueue === 0 && this.currentIndex < this.playlist.length - 1) {
        this.skipToNext();
      }
    });
  }
}

// Usage
const musicPlayer = new PlaylistManager(0);
musicPlayer.loadPlaylist([
  './music/track1.mp3',
  './music/track2.mp3', 
  './music/track3.mp3'
]);
await musicPlayer.startPlaylist();
```

### Dynamic Content Insertion

```typescript
class DynamicContentManager {
  private baseChannel: number = 0;
  private adChannel: number = 1;
  
  async startMainContent(contentUrl: string): Promise<void> {
    await queueAudio(contentUrl, this.baseChannel);
  }
  
  async insertAd(adUrl: string, returnToContent: boolean = true): Promise<void> {
    // Pause main content
    pauseChannel(this.baseChannel);
    
    // Play ad on separate channel
    await queueAudioPriority(adUrl, this.adChannel);
    
    if (returnToContent) {
      // Resume main content when ad finishes
      onAudioComplete(this.adChannel, () => {
        resumeChannel(this.baseChannel);
      });
    }
  }
  
  async insertBreakingNews(newsUrl: string): Promise<void> {
    // Interrupt everything with priority news
    await queueAudioPriority(newsUrl, this.baseChannel);
  }
}
```

### Smart Queue Management

```typescript
class SmartQueueManager {
  private readonly maxQueueSize: number = 10;
  private readonly channel: number;
  
  constructor(channel: number = 0) {
    this.channel = channel;
  }
  
  async smartQueue(audioUrl: string, priority: boolean = false): Promise<boolean> {
    const snapshot = this.channel === 0 ? getQueueSnapshot() : getQueueSnapshot(this.channel);
    
    // Check queue capacity
    if (snapshot.totalItems >= this.maxQueueSize) {
      console.warn(`Queue full on channel ${this.channel}, rejecting: ${audioUrl}`);
      return false;
    }
    
    try {
      if (priority) {
        if (this.channel === 0) {
          await queueAudioPriority(audioUrl);
        } else {
          await queueAudioPriority(audioUrl, this.channel);
        }
      } else {
        if (this.channel === 0) {
          await queueAudio(audioUrl);
        } else {
          await queueAudio(audioUrl, this.channel);
        }
      }
      return true;
    } catch (error) {
      console.error(`Failed to queue ${audioUrl}:`, error);
      return false;
    }
  }
  
  getQueueHealth(): { 
    utilization: number; 
    isHealthy: boolean; 
    recommendation: string 
  } {
    const snapshot = this.channel === 0 ? getQueueSnapshot() : getQueueSnapshot(this.channel);
    const utilization = snapshot.totalItems / this.maxQueueSize;
    
    let recommendation: string;
    let isHealthy: boolean = true;
    
    if (utilization < 0.3) {
      recommendation = 'Queue is light, good for responsiveness';
    } else if (utilization < 0.7) {
      recommendation = 'Queue utilization is optimal';
    } else if (utilization < 0.9) {
      recommendation = 'Queue is getting full, consider reducing load';
      isHealthy = false;
    } else {
      recommendation = 'Queue is nearly full, high risk of rejections';
      isHealthy = false;
    }
    
    return { utilization, isHealthy, recommendation };
  }
  
  async clearOldItems(): Promise<number> {
    // This is conceptual - the package handles queue management internally
    // But you can track and make decisions based on queue state
    const snapshot = this.channel === 0 ? getQueueSnapshot() : getQueueSnapshot(this.channel);
    
    if (snapshot.totalItems > 7) {
      console.log(`Queue has ${snapshot.totalItems} items, consider stopping current audio`);
      if (this.channel === 0) {
        stopCurrentAudioInChannel();
      } else {
        stopCurrentAudioInChannel(this.channel);
      }
      return snapshot.totalItems;
    }
    
    return 0;
  }
}
```

## Queue Timing and Coordination

### Preloading and Timing

```typescript
class TimedQueueManager {
  async scheduleAudio(audioUrl: string, delayMs: number, channel: number = 0): Promise<void> {
    setTimeout(async () => {
      await queueAudio(audioUrl, channel);
      console.log(`Scheduled audio started: ${audioUrl}`);
    }, delayMs);
  }
  
  async createTightPlaylist(tracks: string[], channel: number = 0): Promise<void> {
    // Queue first track immediately
    if (tracks.length > 0) {
      await queueAudio(tracks[0], channel);
    }
    
    // Queue remaining tracks
    for (let i = 1; i < tracks.length; i++) {
      await queueAudio(tracks[i], channel);
    }
    
    console.log(`Queued ${tracks.length} tracks for seamless playback`);
  }
  
  async createGappedPlaylist(tracks: string[], gapMs: number, channel: number = 0): Promise<void> {
    // This is conceptual - you'd need additional logic for gaps
    // The queue system plays tracks seamlessly by design
    
    for (let i = 0; i < tracks.length; i++) {
      if (i === 0) {
        await queueAudio(tracks[i], channel);
      } else {
        // For gaps, you might queue silence or use timed scheduling
        setTimeout(async () => {
          await queueAudio(tracks[i], channel);
        }, i * gapMs);
      }
    }
  }
}
```

### Cross-Channel Synchronization

```typescript
class SynchronizedQueueManager {
  async syncChannelPlayback(channel1: number, channel2: number): Promise<void> {
    // Start audio on both channels simultaneously
    const promises = [
      queueAudio('./audio/left-channel.mp3', channel1),
      queueAudio('./audio/right-channel.mp3', channel2)
    ];
    
    await Promise.all(promises);
    console.log('Synchronized playback started on both channels');
  }
  
  async createCallAndResponse(callTrack: string, responseTrack: string): Promise<void> {
    // Play call on channel 0
    await queueAudio(callTrack, 0);
    
    // When call finishes, play response on channel 1
    onAudioComplete(0, async () => {
      await queueAudio(responseTrack, 1);
    });
  }
  
  async orchestrateMultiChannelSequence(): Promise<void> {
    // Complex multi-channel coordination
    
    // Start background music
    await queueAudio('./music/background.mp3', 0, { loop: true, volume: 0.3 });
    
    // Layer in sound effects
    setTimeout(() => queueAudio('./sfx/wind.mp3', 1), 2000);
    setTimeout(() => queueAudio('./sfx/birds.mp3', 2), 4000);
    
    // Add narration that ducks other audio
    setTimeout(async () => {
      // Duck background channels
      setChannelVolume(0, 0.1);
      setChannelVolume(1, 0.2);
      setChannelVolume(2, 0.2);
      
      // Play narration
      await queueAudio('./voice/narration.mp3', 3);
      
      // Restore volumes when narration ends
      onAudioComplete(3, () => {
        setChannelVolume(0, 0.3);
        setChannelVolume(1, 1.0);
        setChannelVolume(2, 1.0);
      });
    }, 6000);
  }
}
```

## Performance Optimization

### Efficient Queue Operations

```typescript
class EfficientQueueManager {
  private queueCache: Map<number, QueueSnapshot> = new Map();
  private cacheTimeout: number = 1000; // 1 second cache
  
  getCachedQueueSnapshot(channel: number): QueueSnapshot {
    const cached = this.queueCache.get(channel);
    if (cached) {
      return cached;
    }
    
    const snapshot = getQueueSnapshot(channel);
    this.queueCache.set(channel, snapshot);
    
    // Clear cache after timeout
    setTimeout(() => {
      this.queueCache.delete(channel);
    }, this.cacheTimeout);
    
    return snapshot;
  }
  
  async batchQueueAudio(audioFiles: string[], channel: number): Promise<void> {
    // Queue multiple files efficiently
    const promises = audioFiles.map(file => queueAudio(file, channel));
    await Promise.all(promises);
    console.log(`Batch queued ${audioFiles.length} files on channel ${channel}`);
  }
  
  optimizeQueueSize(channel: number, maxItems: number = 5): void {
    const snapshot = this.getCachedQueueSnapshot(channel);
    
    if (snapshot.totalItems > maxItems) {
      console.warn(`Channel ${channel} queue has ${snapshot.totalItems} items, above optimal size of ${maxItems}`);
      // Consider stopping current audio to clear queue
    }
  }
}
```

## Common Queue Patterns

### Gaming Audio Queues

```typescript
class GameAudioQueue {
  private musicChannel: number = 0;
  private sfxChannel: number = 1;
  private voiceChannel: number = 2;
  
  async playGameSequence(): Promise<void> {
    // Background music (looped)
    await queueAudio('./music/game-theme.mp3', this.musicChannel, { 
      loop: true, 
      volume: 0.4 
    });
    
    // Immediate sound effects
    await queueAudio('./sfx/sword-swing.wav', this.sfxChannel);
    await queueAudio('./sfx/hit-impact.wav', this.sfxChannel);
    
    // Character dialog (interrupts other voice)
    await queueAudioPriority('./voice/victory-shout.mp3', this.voiceChannel);
  }
  
  async handleEmergency(): Promise<void> {
    // Stop everything and play alert
    stopCurrentAudioInChannel(this.musicChannel);
    stopCurrentAudioInChannel(this.sfxChannel);
    await queueAudioPriority('./alerts/game-over.mp3', this.voiceChannel);
  }
}
```

### Podcast Queue Management

```typescript
class PodcastQueueManager {
  private contentChannel: number = 0;
  private currentSegment: number = 0;
  private segments: string[] = [];
  
  loadEpisode(segments: string[]): void {
    this.segments = segments;
    this.currentSegment = 0;
  }
  
  async startEpisode(): Promise<void> {
    if (this.segments.length === 0) return;
    
    // Queue all segments
    for (const segment of this.segments) {
      await queueAudio(segment, this.contentChannel);
    }
    
    this.setupSegmentTracking();
  }
  
  private setupSegmentTracking(): void {
    onAudioComplete(this.contentChannel, (info) => {
      this.currentSegment++;
      console.log(`Completed segment ${this.currentSegment}: ${info.fileName}`);
      
      if (this.currentSegment >= this.segments.length) {
        console.log('Episode completed!');
      }
    });
  }
  
  async insertAdBreak(adUrls: string[]): Promise<void> {
    // Pause main content
    pauseChannel(this.contentChannel);
    
    // Queue ads
    for (const ad of adUrls) {
      await queueAudio(ad, 1); // Ad channel
    }
    
    // Resume after all ads
    onQueueChange(1, (snapshot) => {
      if (snapshot.totalItems === 0 && !snapshot.isChannelActive) {
        resumeChannel(this.contentChannel);
      }
    });
  }
}
```

## Next Steps

Now that you understand the queue system, explore:

- **[Event System](./event-system.md)** - React to queue and playback events
- **[Audio Lifecycle](./audio-lifecycle.md)** - Complete audio playback flow  
- **[Performance & Memory](./performance-memory.md)** - Optimization strategies
- **[API Reference](../api-reference/queue-management.md)** - Detailed function documentation 