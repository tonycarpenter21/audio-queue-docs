# Event System

Understanding the comprehensive event system that powers real-time audio monitoring and reactive programming patterns.

## What is the Event System?

The audio-channel-queue package provides a rich event system that allows you to react to audio playback changes, queue modifications, and progress updates in real-time. Events are channel-specific and fire automatically during audio operations.

```typescript
import { 
  onAudioStart, 
  onAudioComplete, 
  onAudioProgress, 
  onQueueChange,
  offAudioStart,
  offAudioComplete,
  offAudioProgress,
  offQueueChange
} from 'audio-channel-queue';

// React to audio starting
const cleanupStart = onAudioStart(0, (info) => {
  console.log(`Started playing: ${info.fileName}`);
});

// React to audio completing
const cleanupComplete = onAudioComplete(0, (info) => {
  console.log(`Finished: ${info.fileName}`);
  console.log(`Remaining in queue: ${info.remainingInQueue}`);
});

// Track playback progress
const cleanupProgress = onAudioProgress(0, (info) => {
  console.log(`Progress: ${Math.round(info.progress * 100)}%`);
});

// Monitor queue changes
const cleanupQueue = onQueueChange(0, (snapshot) => {
  console.log(`Queue now has ${snapshot.totalItems} items`);
});
```

## Core Event Types

### Audio Start Events

Fired when audio begins playing on a channel:

```typescript
import { onAudioStart, AudioStartInfo } from 'audio-channel-queue';

onAudioStart(0, (info: AudioStartInfo) => {
  console.log('Audio started:', {
    fileName: info.fileName,
    duration: `${Math.round(info.duration / 1000)} seconds`,
    volume: `${Math.round(info.volume * 100)}%`,
    currentTime: info.currentTime
  });
  
  // Example: Update UI
  updateNowPlaying(info.fileName);
  setProgressBarMax(info.duration);
});

function updateNowPlaying(fileName: string): void {
  const element = document.getElementById('now-playing');
  if (element) {
    element.textContent = `Now Playing: ${fileName}`;
  }
}

function setProgressBarMax(duration: number): void {
  const progressBar = document.getElementById('progress') as HTMLProgressElement;
  if (progressBar) {
    progressBar.max = duration;
  }
}
```

### Audio Complete Events

Fired when audio finishes playing (naturally or interrupted):

```typescript
import { onAudioComplete, AudioCompleteInfo } from 'audio-channel-queue';

onAudioComplete(0, (info: AudioCompleteInfo) => {
  console.log('Audio completed:', {
    fileName: info.fileName,
    channelNumber: info.channelNumber,
    remainingInQueue: info.remainingInQueue,
    src: info.src
  });
});
```

### Audio Progress Events

Fired continuously during audio playback for real-time progress tracking:

```typescript
import { onAudioProgress, AudioInfo } from 'audio-channel-queue';

onAudioProgress(0, (info: AudioInfo) => {
  const percentage = Math.round(info.progress * 100);
  const currentSeconds = Math.floor(info.currentTime / 1000);
  const totalSeconds = Math.floor(info.duration / 1000);
  
  // Update progress display
  updateProgressDisplay(percentage, currentSeconds, totalSeconds);
  
  // Trigger events at specific progress points
  if (info.progress >= 0.25 && info.progress < 0.26) {
    console.log('25% complete');
    onQuarterProgress(info.fileName);
  }
  
  if (info.progress >= 0.5 && info.progress < 0.51) {
    console.log('50% complete');
    onHalfwayProgress(info.fileName);
  }
  
  if (info.progress >= 0.75 && info.progress < 0.76) {
    console.log('75% complete');
    onThreeQuarterProgress(info.fileName);
  }
});

function updateProgressDisplay(percentage: number, current: number, total: number): void {
  // Update progress bar
  const progressBar = document.getElementById('progress') as HTMLProgressElement;
  if (progressBar) {
    progressBar.value = percentage;
  }
  
  // Update time display
  const timeDisplay = document.getElementById('time-display');
  if (timeDisplay) {
    timeDisplay.textContent = `${current}s / ${total}s (${percentage}%)`;
  }
}

function onQuarterProgress(fileName: string): void {
  console.log(`${fileName} is 25% complete`);
}

function onHalfwayProgress(fileName: string): void {
  console.log(`${fileName} is 50% complete - halfway point reached`);
}

function onThreeQuarterProgress(fileName: string): void {
  console.log(`${fileName} is 75% complete - almost finished`);
}
```

### Queue Change Events

Fired when the queue is modified (items added, removed, or reordered):

```typescript
import { onQueueChange, QueueSnapshot } from 'audio-channel-queue';

onQueueChange(0, (snapshot: QueueSnapshot) => {
  console.log('Queue changed:', {
    snapshot.totalItems,
    snapshot.currentIndex,
    snapshot.isPaused,
    snapshot.channelNumber,
    snapshot.items,
    snapshot.volume,
  });
  
  // Update queue display
  updateQueueDisplay(snapshot);
  
  // Handle queue state changes
  if (snapshot.totalItems === 0) {
    onQueueEmpty();
  } else if (snapshot.totalItems === 1) {
    const currentItem = snapshot.items[0];
    onLastItem(currentItem ? currentItem.fileName : null);
  } else if (snapshot.totalItems > 10) {
    onQueueOverloaded(snapshot.totalItems);
  }
});

function updateQueueDisplay(snapshot: QueueSnapshot): void {
  const queueList = document.getElementById('queue-list');
  if (!queueList) return;
  
  queueList.innerHTML = '';
  snapshot.items.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.className = item.isCurrentlyPlaying ? 'playing' : 'queued';
    listItem.textContent = `${item.position}. ${item.fileName}`;
    queueList.appendChild(listItem);
  });
}

function onQueueEmpty(): void {
  console.log('Queue is now empty');
  // Maybe show "Add music" prompt
}

function onLastItem(fileName: string | null): void {
  console.log(`Last item in queue: ${fileName}`);
  // Maybe start preloading next playlist
}

function onQueueOverloaded(count: number): void {
  console.warn(`Queue has ${count} items - may impact performance`);
}
```

## Event Management Patterns

### Event Handler Classes

Organize event handling with dedicated classes:

```typescript
class AudioEventManager {
  private channel: number;
  private isSetup: boolean = false;
  
  constructor(channel: number = 0) {
    this.channel = channel;
  }
  
  setupAllEventHandlers(): void {
    if (this.isSetup) return;
    
    this.setupStartHandler();
    this.setupCompleteHandler();
    this.setupProgressHandler();
    this.setupQueueHandler();
    
    this.isSetup = true;
    console.log(`Event handlers setup for channel ${this.channel}`);
  }
  
  private setupStartHandler(): void {
    onAudioStart(this.channel, (info) => {
      console.log(`[${this.channel}] Started: ${info.fileName}`);
      this.onAudioStarted(info);
    });
  }
  
  private setupCompleteHandler(): void {
    onAudioComplete(this.channel, (info) => {
      console.log(`[${this.channel}] Completed: ${info.fileName}`);
      this.onAudioCompleted(info);
    });
  }
  
  private setupProgressHandler(): void {
    onAudioProgress(this.channel, (info) => {
      this.onAudioProgress(info);
    });
  }
  
  private setupQueueHandler(): void {
    onQueueChange(this.channel, (snapshot) => {
      console.log(`[${this.channel}] Queue changed: ${snapshot.totalItems} items`);
      this.onQueueChanged(snapshot);
    });
  }
  
  // Override these methods in subclasses
  protected onAudioStarted(info: AudioStartInfo): void {
    // Default implementation
  }
  
  protected onAudioCompleted(info: AudioCompleteInfo): void {
    // Default implementation
  }
  
  protected onAudioProgress(info: AudioInfo): void {
    // Default implementation - called frequently
  }
  
  protected onQueueChanged(snapshot: QueueSnapshot): void {
    // Default implementation
  }
  
  // Clean up all event listeners
  cleanupAlternative(): void {
    if (!this.isSetup) return;
    
    console.log(`Cleaning up all event listeners for channel ${this.channel} using off* methods`);
    
    // Remove all event listeners for this channel
    offAudioStart(this.channel);
    offAudioComplete(this.channel);
    offAudioProgress(this.channel);
    offQueueChange(this.channel);
    
    this.cleanupFunctions = [];
    this.isSetup = false;
  }
}

// Gaming-specific event handler
class GameAudioEventManager extends AudioEventManager {
  protected onAudioStarted(info: AudioStartInfo): void {
    // Update game UI
    this.updateGameUI(`Playing: ${info.fileName}`);
    
    // Log for analytics
    this.logGameAudioEvent('start', info.fileName);
  }
  
  protected onAudioCompleted(info: AudioCompleteInfo): void {
    console.log(`Game audio completed: ${info.fileName} on channel ${info.channelNumber}`);
    
    this.logGameAudioEvent('complete', info.fileName);
  }
  
  private updateGameUI(message: string): void {
    // Update game interface
    console.log(`Game UI: ${message}`);
  }
  
  private logGameAudioEvent(type: string, fileName: string): void {
    // Send to analytics
    console.log(`Analytics: ${type} - ${fileName}`);
  }
}
```

### Cross-Channel Event Coordination

Coordinate events across multiple channels:

```typescript
class MultiChannelEventCoordinator {
  private musicChannel: number = 0;
  private sfxChannel: number = 1;
  private voiceChannel: number = 2;
  
  setupCrossChannelCoordination(): void {
    this.setupVoiceDucking();
    this.setupMusicTransitions();
    this.setupSfxLimiting();
  }
  
  private setupVoiceDucking(): void {
    // Duck music and SFX when voice starts
    onAudioStart(this.voiceChannel, (info) => {
      console.log('Voice started - ducking other channels');
      // Use the proper ducking API instead of individual channel adjustments
      setVolumeDucking({
        priorityChannel: this.voiceChannel,
        priorityVolume: 1.0,
        duckingVolume: 0.2
      });
    });

    // Restore volumes when voice ends
    onAudioComplete(this.voiceChannel, (info) => {
      console.log('Voice ended - restoring channel volumes');
      // No need to manually restore - ducking system handles this automatically
    });
  }
  
  private setupMusicTransitions(): void {
    onAudioComplete(this.musicChannel, (info) => {
      console.log('Music track completed');
      this.considerNextTrack();
    });
  }
  
  private setupSfxLimiting(): void {
    onQueueChange(this.sfxChannel, (snapshot) => {
      if (snapshot.totalItems > 5) {
        console.warn('Too many SFX queued - consider throttling');
        this.throttleSfx();
      }
    });
  }
  
  private considerNextTrack(): void {
    // Logic to decide next music track
    console.log('Considering next music track...');
  }
  
  private throttleSfx(): void {
    // Logic to limit SFX queue
    console.log('Throttling SFX to prevent overload');
  }
  
  // Clean up all event listeners
  cleanupAlternative(): void {
    console.log('Cleaning up all cross-channel event handlers using off* methods');
    
    // Remove all event listeners for all channels
    offAudioStart(this.musicChannel);
    offAudioStart(this.sfxChannel);
    offAudioStart(this.voiceChannel);
    
    offAudioComplete(this.musicChannel);
    offAudioComplete(this.sfxChannel);
    offAudioComplete(this.voiceChannel);
    
    offAudioProgress(this.musicChannel);
    offAudioProgress(this.sfxChannel);
    offAudioProgress(this.voiceChannel);
    
    offQueueChange(this.musicChannel);
    offQueueChange(this.sfxChannel);
    offQueueChange(this.voiceChannel);
    
    this.cleanupFunctions = [];
  }
}
```

### State Machine with Events

Use events to drive complex state machines:

```typescript
enum AudioState {
  STOPPED = 'stopped',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMPLETING = 'completing'
}

class AudioStateMachine {
  private state: AudioState = AudioState.STOPPED;
  private channel: number;
  
  constructor(channel: number = 0) {
    this.channel = channel;
    this.setupStateMachine();
  }
  
  private setupStateMachine(): void {
    onAudioStart(this.channel, () => {
      this.transitionTo(AudioState.PLAYING);
    });
    
    onAudioComplete(this.channel, (info) => {
      if (info.remainingInQueue > 0) {
        this.transitionTo(AudioState.LOADING);
      } else {
        this.transitionTo(AudioState.STOPPED);
      }
    });
    
    onAudioProgress(this.channel, (info) => {
      if (this.state === AudioState.PLAYING) {
        if (info.progress > 0.9) {
          this.transitionTo(AudioState.COMPLETING);
        }
      }
    });

    // Listen for pause events
    onQueueChange(this.channel, (snapshot) => {
      const info = getCurrentAudioInfo(this.channel);
      
      // If there's audio in the queue but it's paused
      if (snapshot.totalItems > 0 && snapshot.isPaused) {
        this.transitionTo(AudioState.PAUSED);
      } 
      // If there was a pause but now we're playing again
      else if (this.state === AudioState.PAUSED && snapshot.totalItems > 0 && !snapshot.isPaused) {
        this.transitionTo(AudioState.PLAYING);
      }
    });
  }
  
  // Public methods to control audio state
  pauseAudio(): void {
    if (this.state === AudioState.PLAYING) {
      pauseChannel(this.channel);
      // State will be updated via the onQueueChange handler
    }
  }
  
  resumeAudio(): void {
    if (this.state === AudioState.PAUSED) {
      resumeChannel(this.channel);
      // State will be updated via the onQueueChange handler
    }
  }
  
  private transitionTo(newState: AudioState): void {
    const oldState = this.state;
    this.state = newState;
    
    console.log(`State transition: ${oldState} → ${newState}`);
    
    // Handle state-specific logic
    switch (newState) {
      case AudioState.STOPPED:
        this.onStopped();
        break;
      case AudioState.PLAYING:
        this.onPlaying();
        break;
      case AudioState.PAUSED:
        this.onPaused();
        break;
      case AudioState.COMPLETING:
        this.onCompleting();
        break;
    }
  }
  
  private onStopped(): void {
    console.log('Audio system is stopped');
    // Maybe start background music
  }
  
  private onPlaying(): void {
    console.log('Audio is playing');
    // Update UI to show play state
  }
  
  private onPaused(): void {
    console.log('Audio is paused');
    // Update UI to show pause state
  }
  
  private onCompleting(): void {
    console.log('Audio is near completion');
    // Maybe preload next track or show completion animation
  }
  
  getCurrentState(): AudioState {
    return this.state;
  }

  getDisplayState(): string {
    const info = getCurrentAudioInfo(this.channel);
    if (!info) return 'Stopped';
    
    return info.isPlaying ? 'Playing' : info.isPaused ? 'Paused' : 'Stopped';
  }
}

// Usage example
const audioMachine = new AudioStateMachine(0);
await queueAudio('./music/track1.mp3', 0);

// Later, pause the audio
audioMachine.pauseAudio();
console.log(`Current state: ${audioMachine.getDisplayState()}`); // "Paused"

// Resume playback
audioMachine.resumeAudio();
console.log(`Current state: ${audioMachine.getDisplayState()}`); // "Playing"

// Real-world example: Audio Player UI
class AudioPlayerUI {
  private stateMachine: AudioStateMachine;
  private channel: number;
  
  constructor(channel: number = 0) {
    this.channel = channel;
    this.stateMachine = new AudioStateMachine(channel);
    this.setupUI();
  }
  
  private setupUI(): void {
    // Update UI based on state changes
    onQueueChange(this.channel, () => {
      this.updateUIControls();
    });
    
    onAudioProgress(this.channel, (info) => {
      this.updateProgressBar(info.progress);
    });
  }
  
  private updateUIControls(): void {
    const state = this.stateMachine.getCurrentState();
    const displayState = this.stateMachine.getDisplayState();
    
    console.log(`Updating UI for state: ${displayState}`);
    
    // Update play/pause button
    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
      if (state === AudioState.PLAYING) {
        playPauseButton.innerHTML = '⏸️'; // Pause icon
        playPauseButton.setAttribute('aria-label', 'Pause');
      } else if (state === AudioState.PAUSED) {
        playPauseButton.innerHTML = '▶️'; // Play icon
        playPauseButton.setAttribute('aria-label', 'Play');
      } else {
        playPauseButton.innerHTML = '▶️'; // Play icon
        playPauseButton.setAttribute('aria-label', 'Play');
        playPauseButton.disabled = state === AudioState.STOPPED;
      }
    }
    
    // Update status text
    const statusElement = document.getElementById('playerStatus');
    if (statusElement) {
      statusElement.textContent = displayState;
      
      // Add appropriate status class
      statusElement.className = 'status';
      statusElement.classList.add(`status-${state.toLowerCase()}`);
    }
  }
  
  private updateProgressBar(progress: number): void {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      const percent = Math.round(progress * 100);
      progressBar.style.width = `${percent}%`;
      progressBar.setAttribute('aria-valuenow', percent.toString());
    }
  }
  
  // Public UI event handlers
  handlePlayPauseClick(): void {
    const state = this.stateMachine.getCurrentState();
    
    if (state === AudioState.PLAYING) {
      this.stateMachine.pauseAudio();
    } else if (state === AudioState.PAUSED) {
      this.stateMachine.resumeAudio();
    } else if (state === AudioState.STOPPED) {
      // Maybe start playing from the beginning or load a default track
      await queueAudio('./music/default.mp3', this.channel);
    }
  }
  
  handleStopClick(): void {
    stopAllAudioInChannel(this.channel);
    // State machine will update via events
  }
}

// Usage
const playerUI = new AudioPlayerUI(0);

// Connect to DOM events
document.getElementById('playPauseButton')?.addEventListener('click', () => {
  playerUI.handlePlayPauseClick();
});

document.getElementById('stopButton')?.addEventListener('click', () => {
  playerUI.handleStopClick();
});
```

## Advanced Event Patterns

### Event Aggregation

Collect and analyze events across time periods:

```typescript
class AudioEventAggregator {
  private events: { type: string; timestamp: number; data: any }[] = [];
  private maxEvents: number = 1000;
  
  constructor() {
    this.setupEventCollection();
  }
  
  private setupEventCollection(): void {
    // Collect all events from channel 0
    onAudioStart(0, (info) => {
      this.recordEvent('audioStart', info);
    });
    
    onAudioComplete(0, (info) => {
      this.recordEvent('audioComplete', info);
    });
    
    onQueueChange(0, (snapshot) => {
      this.recordEvent('queueChange', { totalItems: snapshot.totalItems });
    });
  }
  
  private recordEvent(type: string, data: any): void {
    this.events.push({
      type,
      timestamp: Date.now(),
      data
    });
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
  
  getEventsSince(timestampMs: number): any[] {
    return this.events.filter(event => event.timestamp >= timestampMs);
  }
  
  getEventStats(periodMs: number = 60000): {
    starts: number;
    completions: number;
    queueChanges: number;
  } {
    const since = Date.now() - periodMs;
    const recentEvents = this.getEventsSince(since);
    
    const starts = recentEvents.filter(e => e.type === 'audioStart').length;
    const completions = recentEvents.filter(e => e.type === 'audioComplete').length;
    const queueChanges = recentEvents.filter(e => e.type === 'queueChange').length;
    
    return { starts, completions, queueChanges };
  }
}
```

### Event-Driven Analytics

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
    const stats = this.playbackStats.get(info.fileName) || { count: 0, totalDuration: 0 };
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
  
  getSessionReport(): {
    sessionDuration: number;
    filesPlayed: string[];
    mostPlayedFile: string | null;
    totalCompletions: number;
  } {
    const sessionDuration = Date.now() - this.sessionStart;
    const filesPlayed = Array.from(this.playbackStats.keys());
    
    let mostPlayedFile: string | null = null;
    let maxCount = 0;
    let totalCompletions = 0;
    
    for (const [fileName, stats] of this.playbackStats) {
      if (stats.count > maxCount) {
        maxCount = stats.count;
        mostPlayedFile = fileName;
      }
      totalCompletions += stats.completions || 0;
    }
    
    return {
      sessionDuration,
      filesPlayed,
      mostPlayedFile,
      totalCompletions
    };
  }
}
```

## Event Cleanup and Management

### Event Handler Cleanup

Properly manage event handler lifecycle:

```typescript
class EventHandlerManager {
  private cleanupFunctions: Array<() => void> = [];
  
  addEventHandler(
    channel: number, 
    eventType: 'start' | 'complete' | 'progress' | 'queueChange',
    handler: any
  ): void {
    let cleanup: () => void;
    
    switch (eventType) {
      case 'start':
        cleanup = onAudioStart(channel, handler);
        break;
      case 'complete':
        cleanup = onAudioComplete(channel, handler);
        break;
      case 'progress':
        cleanup = onAudioProgress(channel, handler);
        break;
      case 'queueChange':
        cleanup = onQueueChange(channel, handler);
        break;
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }
    
    this.cleanupFunctions.push(cleanup);
    this.channels.add(channel);
  }
  
  removeAllEventHandlers(): void {
    console.log(`Cleaning up event handlers for ${this.channels.size} channels`);

    for (const channel of this.channels) {
      offAudioStart(channel);
      offAudioComplete(channel);
      offAudioProgress(channel);
      offQueueChange(channel);
    }
    
    this.cleanupFunctions = [];
  }
  
  removeChannelEventHandlers(channel: number): void {
    console.log(`Removing all event handlers for channel ${channel}`);
    
    // Remove all event handlers for a specific channel
    offAudioStart(channel);
    offAudioComplete(channel);
    offAudioProgress(channel);
    offQueueChange(channel);
    
    this.channels.delete(channel);
  }
  
  getHandlerCount(): number {
    return this.cleanupFunctions.length;
  }
}

// Usage
const eventManager = new EventHandlerManager();

// Add handlers
eventManager.addEventHandler(0, 'start', (info) => {
  console.log(`Started: ${info.fileName}`);
});

eventManager.addEventHandler(0, 'complete', (info) => {
  console.log(`Completed: ${info.fileName}`);
});

eventManager.addEventHandler(1, 'start', (info) => {
  console.log(`Channel 1 started: ${info.fileName}`);
});

// Later, clean up when component unmounts or page unloads
window.addEventListener('beforeunload', () => {
  eventManager.removeAllEventHandlers();

  // OR Remove handlers for a specific channel
  // eventManager.removeChannelEventHandlers(0);
});
```

### Performance-Aware Event Handling

Handle high-frequency events efficiently:

```typescript
class PerformantEventHandler {
  private lastProgressUpdate: number = 0;
  private progressThrottle: number = 100; // Update every 100ms max
  private channel: number;
  
  constructor(channel: number = 0) {
    this.channel = channel;
  }
  
  setupOptimizedEventHandlers(): void {
    const channel = this.channel;
    
    onAudioStart(channel, (info) => {
      this.handleAudioStart(info);
    });
    
    onAudioComplete(channel, (info) => {
      this.handleAudioComplete(info);
    });
    
    onAudioProgress(channel, (info) => {
      this.handleThrottledProgress(info);
    });
    
    onQueueChange(channel, (snapshot) => {
      this.handleQueueChange(snapshot);
    });
  }
  
  private handleAudioStart(info: AudioStartInfo): void {
    // Immediate response for start events
    console.log(`Quick start: ${info.fileName}`);
  }
  
  private handleAudioComplete(info: AudioCompleteInfo): void {
    // Immediate response for completion events
    console.log(`Quick complete: ${info.fileName}`);
  }
  
  private handleThrottledProgress(info: AudioInfo): void {
    const now = Date.now();
    
    if (now - this.lastProgressUpdate >= this.progressThrottle) {
      this.lastProgressUpdate = now;
      
      // Only update UI at reasonable intervals
      this.updateProgressUI(info);
    }
  }
  
  private updateProgressUI(info: AudioInfo): void {
    const percentage = Math.round(info.progress * 100);
    console.log(`Progress: ${percentage}%`);
  }
  
  private handleQueueChange(snapshot: QueueSnapshot): void {
    // Queue changes are less frequent but important
    console.log(`Queue: ${snapshot.totalItems} items`);
  }
  
  cleanup(): void {
    console.log(`Cleaning up event handlers for channel ${this.channel}`);
    
    // Remove all event handlers for this channel
    offAudioStart(this.channel);
    offAudioComplete(this.channel);
    offAudioProgress(this.channel);
    offQueueChange(this.channel);
  }
}

// Usage
const handler = new PerformantEventHandler(0);
handler.setupOptimizedEventHandlers();

// Later, when done with this handler
handler.cleanup();
```

## Event Listener Removal

All event listeners can be removed using corresponding "off" methods. This is important for cleaning up event handlers when components unmount or to prevent memory leaks.

### Removing Audio Start Listeners

```typescript
import { onAudioStart, offAudioStart } from 'audio-channel-queue';

// Add listener
const cleanup = onAudioStart(0, (info) => {
  console.log(`Started playing: ${info.fileName}`);
});

offAudioStart(0); // Remove all start listeners for channel 0
```

### Removing Audio Complete Listeners

```typescript
import { onAudioComplete, offAudioComplete } from 'audio-channel-queue';

// Add listener
const cleanup = onAudioComplete(0, (info) => {
  console.log(`Finished playing: ${info.fileName}`);
});

offAudioComplete(0); // Remove all complete listeners for channel 0
```

### Removing Audio Progress Listeners

```typescript
import { onAudioProgress, offAudioProgress } from 'audio-channel-queue';

// Add listener
const cleanup = onAudioProgress(0, (info) => {
  updateProgressBar(info.progress);
});

offAudioProgress(0); // Remove all progress listeners for channel 0
```

### Removing Queue Change Listeners

```typescript
import { onQueueChange, offQueueChange } from 'audio-channel-queue';

// Add listener
const cleanup = onQueueChange(0, (snapshot) => {
  updateQueueUI(snapshot);
});

offQueueChange(0); // Remove all queue change listeners for channel 0
```

## Next Steps

Now that you understand the event system, explore:

- **[Audio Lifecycle](./audio-lifecycle.md)** - Complete audio playback flow with events
- **[Performance & Memory](./performance-memory.md)** - Optimization strategies for events
- **[API Reference](../api-reference/event-listeners.md)** - Detailed event documentation
- **[Examples](../getting-started/basic-usage)** - Real-world event handling patterns
