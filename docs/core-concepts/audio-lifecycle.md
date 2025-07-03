# Audio Lifecycle

Understanding the complete audio lifecycle from queueing to completion, including all states, transitions, and events.

## Audio Lifecycle Overview

Every audio file in the audio-channel-queue system goes through a well-defined lifecycle with distinct phases, state transitions, and events. Understanding this lifecycle is crucial for building robust audio applications.

```typescript
import { 
  queueAudio, 
  onAudioStart, 
  onAudioProgress, 
  onAudioComplete, 
  getCurrentAudioInfo 
} from 'audio-channel-queue';

// Complete lifecycle example
async function demonstrateLifecycle(): Promise<void> {
  console.log('1. Queueing audio...');
  await queueAudio('./audio/demo.mp3'); // Using default channel 0
  
  // 2. Audio starts playing
  onAudioStart(0, (info) => {
    console.log(`2. Audio started: ${info.fileName}`);
    console.log(`   Duration: ${info.duration}ms`);
    console.log(`   Volume: ${info.volume}`);
  });
  
  // 3. Progress updates during playback
  onAudioProgress(0, (info) => {
    const percentage = Math.round(info.progress * 100);
    console.log(`3. Progress: ${percentage}% (${info.currentTime}/${info.duration}ms)`);
  });
  
  // 4. Audio completes
  onAudioComplete(0, (info) => {
    console.log(`4. Audio completed: ${info.fileName}`);
    console.log(`   Channel: ${info.channelNumber}`);
    console.log(`   Source: ${info.src}`);
    console.log(`   Remaining in queue: ${info.remainingInQueue}`);
  });
}
```

## Lifecycle Phases

### Phase 1: Queuing

Audio enters the system when queued on a channel:

```typescript
import { queueAudio, queueAudioPriority, getQueueSnapshot } from 'audio-channel-queue';

class AudioLifecycleTracker {
  async trackQueuePhase(): Promise<void> {
    console.log('📋 Phase 1: Queuing');
    
    // Standard queueing - added to end of queue (using default channel 0)
    await queueAudio('./audio/track1.mp3');
    console.log('✓ track1.mp3 queued normally');
    
    await queueAudio('./audio/track2.mp3');
    console.log('✓ track2.mp3 queued normally');
    
    // Priority queueing - interrupts current playback
    await queueAudioPriority('./audio/urgent.mp3'); // Places sound file in first queue spot behind currently playing sound
    console.log('✓ urgent.mp3 queued with priority');
    await stopCurrentSound(); // This is what interrupts current playback
    
    // Check queue state after queueing
    const snapshot = getQueueSnapshot(); // Using default channel 0
    console.log(`Queue now has ${snapshot.totalItems} items`);
    snapshot.items.forEach((item, index) => {
      const status = item.isCurrentlyPlaying ? 'Playing' : 'Queued';
      console.log(`  ${item.position}. ${status}: ${item.fileName}`);
    });
  }
}
```

### Phase 2: Loading & Preparation

Before playback begins, the audio element is prepared:

```typescript
import { onAudioStart } from 'audio-channel-queue';

class LoadingPhaseTracker {
  setupLoadingTracking(): void {
    console.log('📂 Phase 2: Loading & Preparation');
    
    onAudioStart(0, (info) => {
      console.log(`✓ Audio loaded and ready: ${info.fileName}`);
      console.log(`  Channel: ${info.channelNumber}`);
      console.log(`  Source: ${info.src}`);
      console.log(`  Duration determined: ${info.duration}ms`);
      
      // Audio is fully loaded and playback has started
      this.onAudioLoaded(info);
    });
  }
  
  private onAudioLoaded(info: AudioStartInfo): void {
    // The audio file has been successfully loaded
    // The HTML audio element is created and configured
    // Playback has begun
    console.log(`Loading complete for ${info.fileName}`);
  }
}
```

### Phase 3: Active Playback

During active playback, continuous progress events are fired:

```typescript
import { onAudioProgress, AudioInfo } from 'audio-channel-queue';

class PlaybackPhaseTracker {
  private milestones: Set<number> = new Set();
  
  setupPlaybackTracking(): void {
    console.log('▶️ Phase 3: Active Playback');
    
    onAudioProgress(0, (info) => {
      this.trackPlaybackProgress(info);
      this.checkMilestones(info);
      this.updateUI(info);
    });
  }
  
  private trackPlaybackProgress(info: AudioInfo): void {
    // Continuous playback monitoring
    const percentage = Math.round(info.progress * 100);
    
    // Log progress periodically (every 10%)
    if (percentage % 10 === 0 && !this.milestones.has(percentage)) {
      console.log(`⏸️ Progress: ${percentage}% - ${info.fileName}`);
      console.log(`   Time: ${info.currentTime}ms / ${info.duration}ms`);
      this.milestones.add(percentage);
    }
  }
  
  private checkMilestones(info: AudioInfo): void {
    // Check for important milestones
    const progress = info.progress;
    
    if (progress >= 0.1 && progress < 0.11) {
      this.onEarlyPlayback(info);
    } else if (progress >= 0.5 && progress < 0.51) {
      this.onMidpoint(info);
    } else if (progress >= 0.9 && progress < 0.91) {
      this.onNearingEnd(info);
    }
  }
  
  private onEarlyPlayback(info: AudioInfo): void {
    console.log(`🎵 Early playback (10%): ${info.fileName}`);
    // Good time to start preloading next track
  }
  
  private onMidpoint(info: AudioInfo): void {
    console.log(`🎯 Midpoint reached (50%): ${info.fileName}`);
    // Analytics milestone, UI updates
  }
  
  private onNearingEnd(info: AudioInfo): void {
    console.log(`🏁 Nearing end (90%): ${info.fileName}`);
    // Prepare for transition to next track
  }
  
  private updateUI(info: AudioInfo): void {
    // Update progress bar, time display, etc.
    const percentage = Math.round(info.progress * 100);
    // UI update logic here
  }
}
```

### Phase 4: Completion or Interruption

Audio lifecycle ends either naturally or through interruption:

```typescript
import { onAudioComplete, stopCurrentAudioInChannel } from 'audio-channel-queue';

class CompletionPhaseTracker {
  setupCompletionTracking(): void {
    console.log('🏁 Phase 4: Completion or Interruption');
    
    onAudioComplete(0, (info) => {
      this.analyzeCompletion(info);
      this.handlePostCompletion(info);
    });
  }
  
  private analyzeCompletion(info: AudioCompleteInfo): void {
    console.log(`Completion analysis for: ${info.fileName}`);
    console.log(`  Channel: ${info.channelNumber}`);
    console.log(`  Source: ${info.src}`);
    console.log(`  Remaining in queue: ${info.remainingInQueue}`);
    
    // Process completion
    this.handleCompletion(info);
  }
  
  private handleCompletion(info: AudioCompleteInfo): void {
    console.log(`✅ Completed: ${info.fileName}`);
    console.log(`   Channel: ${info.channelNumber}`);
    
    // Update completion stats
    this.trackSuccessfulCompletion(info);
    
    // Consider auto-advancing or looping
    this.handleSuccessfulCompletion(info);
  }
  
  private handlePostCompletion(info: AudioCompleteInfo): void {
    if (info.remainingInQueue === 0) {
      this.onQueueEmpty();
    } else {
      this.onMoreItemsInQueue(info.remainingInQueue);
    }
  }
  
  private trackSuccessfulCompletion(info: AudioCompleteInfo): void {
    // Analytics tracking for successful completions
    console.log(`Analytics: Completion - ${info.fileName}`);
  }
  
  private handleSuccessfulCompletion(info: AudioCompleteInfo): void {
    // Handle successful completion logic
    console.log(`Success handler for ${info.fileName}`);
  }
  
  private onQueueEmpty(): void {
    console.log('🔕 Queue is now empty - session ended');
    // Handle end of playback session
  }
  
  private onMoreItemsInQueue(remaining: number): void {
    console.log(`▶️ Queue continues with ${remaining} items`);
    // Next item will automatically start playing
  }
}
```

## Complete Lifecycle State Machine

Here's a comprehensive state machine that tracks the entire audio lifecycle:

```typescript
enum AudioLifecycleState {
  IDLE = 'idle',
  QUEUED = 'queued',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMPLETING = 'completing',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
  ERROR = 'error'
}

class AudioLifecycleStateMachine {
  protected channel: number;
  protected currentAudio: string | null = null;
  protected errorMessage: string | null = null;
  protected manualInterrupt: boolean = false;
  protected startTime: number = 0;
  protected state: AudioLifecycleState = AudioLifecycleState.IDLE;
  
  constructor(channel: number = 0) {
    // Validate channel number
    if (channel < 0) {
      throw new Error("Channel number must be non-negative");
    }
    
    this.channel = channel;
    this.setupLifecycleTracking();
  }
  
  protected setupLifecycleTracking(): void {
    // Track queue changes to detect queuing
    onQueueChange(this.channel, (snapshot) => {
      if (snapshot.totalItems > 0) {
        // Handle first item added to queue
        if (this.state === AudioLifecycleState.IDLE) {
          this.transitionTo(AudioLifecycleState.QUEUED);
        }
        
        // Handle pause/resume state changes
        if (snapshot.isPaused && this.state === AudioLifecycleState.PLAYING) {
          this.transitionTo(AudioLifecycleState.PAUSED);
        } else if (!snapshot.isPaused && this.state === AudioLifecycleState.PAUSED) {
          this.transitionTo(AudioLifecycleState.PLAYING);
        }
      } else if (snapshot.totalItems === 0 && 
                [AudioLifecycleState.COMPLETED, AudioLifecycleState.INTERRUPTED, AudioLifecycleState.ERROR].includes(this.state)) {
        // Only transition to IDLE if we're in a terminal state and queue is empty
        this.transitionTo(AudioLifecycleState.IDLE);
      }
    });
    
    // Track audio start
    onAudioStart(this.channel, (info) => {
      this.currentAudio = info.fileName;
      this.startTime = Date.now();
      this.transitionTo(AudioLifecycleState.PLAYING);
      this.manualInterrupt = false; // Reset interrupt flag on new audio start
    });
    
    // Track audio complete
    onAudioComplete(this.channel, (info) => {
      // Use our manual interrupt flag to determine if this was interrupted
      const wasInterrupted = this.manualInterrupt;
      
      // Also consider it an interruption if it completes before reaching COMPLETING state
      // but wasn't manually interrupted and didn't complete from PLAYING state
      const unexpectedCompletion = !wasInterrupted && 
                                   this.state !== AudioLifecycleState.COMPLETING &&
                                   this.state !== AudioLifecycleState.PLAYING;
      
      if (wasInterrupted || unexpectedCompletion) {
        this.transitionTo(AudioLifecycleState.INTERRUPTED);
      } else {
        this.transitionTo(AudioLifecycleState.COMPLETED);
      }
      
      this.manualInterrupt = false; // Reset flag
    });
    
    // Track progress for state transitions
    onAudioProgress(this.channel, (info) => {
      if (info.progress > 0.9 && this.state === AudioLifecycleState.PLAYING) {
        this.transitionTo(AudioLifecycleState.COMPLETING);
      }
    });
    
    // Track audio errors
    onAudioError(this.channel, (errorInfo) => {
      this.errorMessage = errorInfo.error.message;
      this.transitionTo(AudioLifecycleState.ERROR);
    });
  }
  
  protected transitionTo(newState: AudioLifecycleState): void {
    const oldState = this.state;
    this.state = newState;
    
    console.log(`🔄 Lifecycle: ${oldState} → ${newState}`);
    
    // Handle state-specific logic
    this.handleStateEntry(newState, oldState);
  }
  
  protected handleStateEntry(state: AudioLifecycleState, previousState: AudioLifecycleState): void {
    const elapsed = this.getElapsedTime();
    
    switch (state) {
      case AudioLifecycleState.IDLE:
        console.log('💤 Audio system is idle');
        this.onIdle();
        break;
        
      case AudioLifecycleState.QUEUED:
        console.log(`📋 Audio queued: ${this.currentAudio || 'Unknown'}`);
        this.onQueued();
        break;
        
      case AudioLifecycleState.PLAYING:
        console.log(`▶️ Audio playing: ${this.currentAudio}`);
        this.onPlaying();
        break;
        
      case AudioLifecycleState.PAUSED:
        console.log(`⏸️ Audio paused: ${this.currentAudio} (${elapsed}ms elapsed so far)`);
        this.onPaused();
        break;
        
      case AudioLifecycleState.COMPLETING:
        console.log(`🏁 Audio completing: ${this.currentAudio} (${elapsed}ms elapsed)`);
        this.onCompleting();
        break;
        
      case AudioLifecycleState.COMPLETED:
        console.log(`✅ Audio completed: ${this.currentAudio} (${elapsed}ms total)`);
        this.onCompleted();
        break;
        
      case AudioLifecycleState.INTERRUPTED:
        console.log(`⏹️ Audio interrupted: ${this.currentAudio} (${elapsed}ms elapsed)`);
        this.onInterrupted();
        break;
        
      case AudioLifecycleState.ERROR:
        console.log(`❌ Audio error: ${this.currentAudio} (${this.errorMessage})`);
        this.onError();
        break;
    }
  }
  
  // State-specific handlers (protected for extensibility)
  protected onIdle(): void {
    this.currentAudio = null;
    this.startTime = 0;
    this.errorMessage = null;
    // Maybe start background music or show idle UI
  }
  
  protected onQueued(): void {
    // Audio is in queue, waiting to play
    // Good time to show "Loading..." UI
  }
  
  protected onPlaying(): void {
    // Audio is actively playing
    // Update UI to show play state, enable pause/skip controls
  }
  
  protected onPaused(): void {
    // Audio is paused
    // Update UI to show pause state, enable resume control
  }
  
  protected onCompleting(): void {
    // Audio is near end
    // Good time to preload next track or prepare transition
  }
  
  protected onCompleted(): void {
    // Audio finished successfully
    // Update analytics, show completion feedback
  }
  
  protected onInterrupted(): void {
    // Audio was stopped early
    // Log interruption, handle cleanup
  }
  
  protected onError(): void {
    // Handle error state
    console.error(`Audio playback error: ${this.errorMessage}`);
    // Maybe retry, show error UI, etc.
  }
  
  // Public interface
  public getCurrentState(): AudioLifecycleState {
    return this.state;
  }
  
  public getCurrentAudio(): string | null {
    return this.currentAudio;
  }
  
  public getElapsedTime(): number {
    return this.startTime > 0 ? Date.now() - this.startTime : 0;
  }
  
  public getErrorMessage(): string | null {
    return this.errorMessage;
  }
  
  public isActive(): boolean {
    return [
      AudioLifecycleState.QUEUED,
      AudioLifecycleState.PLAYING,
      AudioLifecycleState.PAUSED,
      AudioLifecycleState.COMPLETING
    ].includes(this.state);
  }
  
  public hasError(): boolean {
    return this.state === AudioLifecycleState.ERROR;
  }
  
  // Public interface to control audio state
  public pauseAudio(fadeType: FadeType = FadeType.Gentle): void {
    if (this.state === AudioLifecycleState.PLAYING) {
      pauseWithFade(fadeType, this.channel);
      // State transition will happen via onQueueChange event
    }
  }
  
  public resumeAudio(fadeType: FadeType = FadeType.Gentle): void {
    if (this.state === AudioLifecycleState.PAUSED) {
      resumeWithFade(fadeType, this.channel);
      // State transition will happen via onQueueChange event
    }
  }
  
  public stopAudio(): void {
    if (this.isActive()) {
      this.manualInterrupt = true; // Flag that this is a manual interruption
      await stopCurrentAudioInChannel(this.channel);
      // State transition will happen via onAudioComplete event
    }
  }
  
  public skipToNext(): void {
    if (this.isActive()) {
      this.manualInterrupt = true; // Flag that this is a manual interruption
      await stopCurrentAudioInChannel(this.channel);
      // State transition will happen via onAudioComplete event
    }
  }
  
  public retry(): boolean {
    if (this.state === AudioLifecycleState.ERROR && this.currentAudio) {
      // Try to queue the same audio again
      await queueAudio(this.currentAudio, this.channel, { addToFront: true });
      return true;
    }
    return false;
  }
  
  public destroy(): void {
    // Unsubscribe from all events to prevent memory leaks
    offQueueChange(this.channel);
    offAudioStart(this.channel);
    offAudioComplete(this.channel);
    offAudioProgress(this.channel);
    offAudioError(this.channel);
    
    // Reset state
    this.state = AudioLifecycleState.IDLE;
    this.currentAudio = null;
    this.startTime = 0;
    this.errorMessage = null;
    this.manualInterrupt = false;
  }
}
```

## Lifecycle Monitoring and Analytics

Track audio lifecycle for performance monitoring and analytics:

```typescript
class AudioLifecycleAnalytics {
  private lifecycleEvents: Array<{
    timestamp: number;
    state: string;
    audioFile: string | null;
    duration?: number;
  }> = [];
  
  private sessionStats = {
    totalQueued: 0,
    totalStarted: 0,
    totalCompleted: 0,
    totalInterrupted: 0,
    totalErrors: 0,
    totalPlaybackTime: 0
  };
  
  private trackingMap = new Map<string, { startTime: number, lastState: string }>();
  private channel: number;
  
  constructor(channel: number = 0) {
    // Validate channel number
    if (channel < 0) {
      throw new Error("Channel number must be non-negative");
    }
    
    this.channel = channel;
    this.setupAnalytics();
  }
  
  private setupAnalytics(): void {
    // Track when audio is queued
    onQueueChange(this.channel, (snapshot) => {
      if (snapshot.totalItems > 0 && snapshot.items[0]) {
        const currentTrack = snapshot.items[0].fileName;
        
        // Only record new items being queued
        if (!this.trackingMap.has(currentTrack)) {
          this.recordEvent('queued', currentTrack);
          this.sessionStats.totalQueued++;
          this.trackingMap.set(currentTrack, { 
            startTime: 0, 
            lastState: 'queued' 
          });
        }
      }
    });
    
    // Track audio start events
    onAudioStart(this.channel, (info) => {
      const fileName = info.fileName || 'unknown';
      const trackData = this.trackingMap.get(fileName) || { 
        startTime: 0, 
        lastState: '' 
      };
      
      // Record playback start time for duration calculation
      trackData.startTime = Date.now();
      trackData.lastState = 'started';
      this.trackingMap.set(fileName, trackData);
      
      this.recordEvent('started', fileName);
      this.sessionStats.totalStarted++;
    });
    
    // Track when audio completes naturally
    onAudioComplete(this.channel, (info) => {
      const fileName = info.fileName || 'unknown';
      const trackData = this.trackingMap.get(fileName);
      
      if (trackData) {
        // Calculate playback duration
        const playbackDuration = trackData.startTime > 0 ? 
          Date.now() - trackData.startTime : 0;
        
        // Determine if this was a natural completion or interruption
        // If we have a remaining queue count, this was likely interrupted
        const wasInterrupted = info.remainingInQueue > 0 && 
          trackData.lastState !== 'paused';
        
        if (wasInterrupted) {
          this.recordEvent('interrupted', fileName, playbackDuration);
          this.sessionStats.totalInterrupted++;
        } else {
          this.recordEvent('completed', fileName, playbackDuration);
          this.sessionStats.totalCompleted++;
        }
        
        // Update total playback time
        this.sessionStats.totalPlaybackTime += playbackDuration;
        
        // Clean up tracking
        this.trackingMap.delete(fileName);
      }
    });
    
    // Track audio pause events
    onAudioPause(this.channel, (info) => {
      const fileName = info.fileName || 'unknown';
      const trackData = this.trackingMap.get(fileName);
      
      if (trackData) {
        trackData.lastState = 'paused';
        this.trackingMap.set(fileName, trackData);
        this.recordEvent('paused', fileName);
      }
    });
    
    // Track audio resume events
    onAudioResume(this.channel, (info) => {
      const fileName = info.fileName || 'unknown';
      const trackData = this.trackingMap.get(fileName);
      
      if (trackData) {
        trackData.lastState = 'resumed';
        this.trackingMap.set(fileName, trackData);
        this.recordEvent('resumed', fileName);
      }
    });
    
    // Track audio errors
    onAudioError(this.channel, (errorInfo) => {
      const fileName = errorInfo.audioUrl ? 
        extractFileName(errorInfo.audioUrl) : 'unknown';
      
      this.recordEvent('error', fileName);
      this.sessionStats.totalErrors++;
      
      // Clean up tracking for this file
      this.trackingMap.delete(fileName);
    });
  }
  
  private recordEvent(
    state: string, 
    audioFile: string | null, 
    duration?: number
  ): void {
    const event = {
      timestamp: Date.now(),
      state,
      audioFile: audioFile || null,
      ...(duration !== undefined ? { duration } : {})
    };
    
    this.lifecycleEvents.push(event);
    console.log(`📊 Lifecycle Event: ${state} - ${audioFile || 'Unknown'}${
      duration ? ` (${duration}ms)` : ''
    }`);
  }
  
  public getLifecycleReport(): {
    sessionDuration: number;
    totalEvents: number;
    completionRate: number;
    sessionStats: typeof this.sessionStats;
  } {
    const sessionDuration = this.lifecycleEvents.length > 0 
      ? Date.now() - this.lifecycleEvents[0].timestamp 
      : 0;
    
    const completionRate = this.sessionStats.totalStarted > 0 
      ? this.sessionStats.totalCompleted / this.sessionStats.totalStarted 
      : 0;
    
    return {
      sessionDuration,
      totalEvents: this.lifecycleEvents.length,
      completionRate,
      sessionStats: { ...this.sessionStats }
    };
  }
}
```

## Next Steps

Now that you understand the complete audio lifecycle, explore:

- **[Performance & Memory](./performance-memory.md)** - Optimization strategies for the entire lifecycle
- **[API Reference](../api-reference/queue-management)** - Detailed function documentation
- **[Examples](../getting-started/basic-usage)** - Real-world lifecycle management patterns
- **[Advanced Features](../advanced/volume-ducking)** - Complex lifecycle scenarios 
