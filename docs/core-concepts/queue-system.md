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
await queueAudioPriority('./voice/emergency-alert.mp3'); // This queues the next sound after the currently playing sound
await stopCurrentAudioInChannel() // This stops the currently playing sound
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
  console.log(`- Current index: ${snapshot.currentIndex}`);
  console.log(`- Is paused: ${snapshot.isPaused}`);
  
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
      console.log(`- Current index: ${snapshot.currentIndex}`);
      
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
    await stopCurrentAudioInChannel(this.channel);
    
    this.currentIndex++;
    if (this.currentIndex < this.playlist.length) {
      await queueAudioPriority(this.playlist[this.currentIndex], this.channel);
    }
  }
  
  async skipToPrevious(): Promise<void> {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    await stopCurrentAudioInChannel(this.channel);
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
    await stopCurrentAudioInChannel(this.voiceChannel)
  }
  
  async handleEmergency(): Promise<void> {
    // Stop everything and play alert
    await stopCurrentAudioInChannel(this.musicChannel);
    await stopCurrentAudioInChannel(this.sfxChannel);
    await queueAudioPriority('./alerts/game-over.mp3', this.voiceChannel);
  }
}
```

## Next Steps

Now that you understand the queue system, explore:

- **[Event System](./event-system.md)** - React to queue and playback events
- **[Audio Lifecycle](./audio-lifecycle.md)** - Complete audio playback flow  
- **[Performance & Memory](./performance-memory.md)** - Optimization strategies
- **[API Reference](../api-reference/queue-management.md)** - Detailed function documentation 