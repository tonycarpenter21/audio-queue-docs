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
    console.log(`   Played for: ${info.playbackDuration}ms`);
    console.log(`   Was interrupted: ${info.wasInterrupted}`);
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
    await queueAudioPriority('./audio/urgent.mp3');
    console.log('✓ urgent.mp3 queued with priority');
    
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
      console.log(`  Element created: ${info.audioElement.tagName}`);
      console.log(`  Source set: ${info.audioElement.src}`);
      console.log(`  Duration determined: ${info.duration}ms`);
      console.log(`  Initial position: ${info.currentTime}ms`);
      
      // Audio element is fully loaded and playback has started
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
import { onAudioProgress, AudioProgressInfo } from 'audio-channel-queue';

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
  
  private trackPlaybackProgress(info: AudioProgressInfo): void {
    // Continuous playback monitoring
    const percentage = Math.round(info.progress * 100);
    
    // Log progress periodically (every 10%)
    if (percentage % 10 === 0 && !this.milestones.has(percentage)) {
      console.log(`⏸️ Progress: ${percentage}% - ${info.fileName}`);
      console.log(`   Time: ${info.currentTime}ms / ${info.duration}ms`);
      this.milestones.add(percentage);
    }
  }
  
  private checkMilestones(info: AudioProgressInfo): void {
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
  
  private onEarlyPlayback(info: AudioProgressInfo): void {
    console.log(`🎵 Early playback (10%): ${info.fileName}`);
    // Good time to start preloading next track
  }
  
  private onMidpoint(info: AudioProgressInfo): void {
    console.log(`🎯 Midpoint reached (50%): ${info.fileName}`);
    // Analytics milestone, UI updates
  }
  
  private onNearingEnd(info: AudioProgressInfo): void {
    console.log(`🏁 Nearing end (90%): ${info.fileName}`);
    // Prepare for transition to next track
  }
  
  private updateUI(info: AudioProgressInfo): void {
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
    console.log(`  Playback duration: ${info.playbackDuration}ms`);
    console.log(`  Was interrupted: ${info.wasInterrupted}`);
    console.log(`  Remaining in queue: ${info.remainingInQueue}`);
    
    if (info.wasInterrupted) {
      this.handleInterruption(info);
    } else {
      this.handleNaturalCompletion(info);
    }
  }
  
  private handleInterruption(info: AudioCompleteInfo): void {
    console.log(`⏹️ Interrupted: ${info.fileName}`);
    console.log(`   Played ${info.playbackDuration}ms before interruption`);
    
    // Log interruption reason
    this.logInterruptionReason(info);
    
    // Update analytics
    this.trackInterruption(info);
  }
  
  private handleNaturalCompletion(info: AudioCompleteInfo): void {
    console.log(`✅ Completed naturally: ${info.fileName}`);
    console.log(`   Full playback duration: ${info.playbackDuration}ms`);
    
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
  
  private logInterruptionReason(info: AudioCompleteInfo): void {
    // This is called when audio is stopped early
    console.log(`Interruption logged for ${info.fileName}`);
  }
  
  private trackInterruption(info: AudioCompleteInfo): void {
    // Analytics tracking for interruptions
    console.log(`Analytics: Interruption - ${info.fileName}`);
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
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMPLETING = 'completing',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted'
}

class AudioLifecycleStateMachine {
  private state: AudioLifecycleState = AudioLifecycleState.IDLE;
  private currentAudio: string | null = null;
  private startTime: number = 0;
  private channel: number;
  
  constructor(channel: number = 0) {
    this.channel = channel;
    this.setupLifecycleTracking();
  }
  
  private setupLifecycleTracking(): void {
    // Track queue changes to detect queuing
    onQueueChange(this.channel, (snapshot) => {
      if (snapshot.totalItems > 0 && this.state === AudioLifecycleState.IDLE) {
        this.transitionTo(AudioLifecycleState.QUEUED);
      } else if (snapshot.totalItems === 0) {
        this.transitionTo(AudioLifecycleState.IDLE);
      }
    });
    
    // Track audio start
    onAudioStart(this.channel, (info) => {
      this.currentAudio = info.fileName;
      this.startTime = Date.now();
      this.transitionTo(AudioLifecycleState.PLAYING);
    });
    
    // Track progress for state transitions
    onAudioProgress(this.channel, (info) => {
      if (info.progress > 0.9 && this.state === AudioLifecycleState.PLAYING) {
        this.transitionTo(AudioLifecycleState.COMPLETING);
      }
    });
    
    // Track completion
    onAudioComplete(this.channel, (info) => {
      if (info.wasInterrupted) {
        this.transitionTo(AudioLifecycleState.INTERRUPTED);
      } else {
        this.transitionTo(AudioLifecycleState.COMPLETED);
      }
      
      // Reset for next audio
      setTimeout(() => {
        if (info.remainingInQueue > 0) {
          this.transitionTo(AudioLifecycleState.QUEUED);
        } else {
          this.transitionTo(AudioLifecycleState.IDLE);
        }
      }, 100);
    });
  }
  
  private transitionTo(newState: AudioLifecycleState): void {
    const oldState = this.state;
    this.state = newState;
    
    console.log(`🔄 Lifecycle: ${oldState} → ${newState}`);
    
    // Handle state-specific logic
    this.handleStateEntry(newState, oldState);
  }
  
  private handleStateEntry(state: AudioLifecycleState, previousState: AudioLifecycleState): void {
    const elapsed = Date.now() - this.startTime;
    
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
    }
  }
  
  // State-specific handlers
  private onIdle(): void {
    this.currentAudio = null;
    this.startTime = 0;
    // Maybe start background music or show idle UI
  }
  
  private onQueued(): void {
    // Audio is in queue, waiting to play
    // Good time to show "Loading..." UI
  }
  
  private onPlaying(): void {
    // Audio is actively playing
    // Update UI to show play state, enable pause/skip controls
  }
  
  private onCompleting(): void {
    // Audio is near end
    // Good time to preload next track or prepare transition
  }
  
  private onCompleted(): void {
    // Audio finished successfully
    // Update analytics, show completion feedback
  }
  
  private onInterrupted(): void {
    // Audio was stopped early
    // Log interruption, handle cleanup
  }
  
  // Public interface
  getCurrentState(): AudioLifecycleState {
    return this.state;
  }
  
  getCurrentAudio(): string | null {
    return this.currentAudio;
  }
  
  getElapsedTime(): number {
    return this.startTime > 0 ? Date.now() - this.startTime : 0;
  }
  
  isActive(): boolean {
    return [
      AudioLifecycleState.QUEUED,
      AudioLifecycleState.PLAYING,
      AudioLifecycleState.COMPLETING
    ].includes(this.state);
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
    totalPlaybackTime: 0
  };
  
  constructor(channel: number = 0) {
    this.setupAnalytics(channel);
  }
  
  private setupAnalytics(channel: number): void {
    // Track all lifecycle events
    onQueueChange(channel, (snapshot) => {
      if (snapshot.totalItems > 0) {
        this.recordEvent('queued', snapshot.currentlyPlaying);
        this.sessionStats.totalQueued++;
      }
    });
    
    onAudioStart(channel, (info) => {
      this.recordEvent('started', info.fileName);
      this.sessionStats.totalStarted++;
    });
    
    onAudioComplete(channel, (info) => {
      if (info.wasInterrupted) {
        this.recordEvent('interrupted', info.fileName, info.playbackDuration);
        this.sessionStats.totalInterrupted++;
      } else {
        this.recordEvent('completed', info.fileName, info.playbackDuration);
        this.sessionStats.totalCompleted++;
      }
      
      this.sessionStats.totalPlaybackTime += info.playbackDuration;
    });
  }
  
  private recordEvent(state: string, audioFile: string | null, duration?: number): void {
    this.lifecycleEvents.push({
      timestamp: Date.now(),
      state,
      audioFile,
      duration
    });
    
    console.log(`📊 Lifecycle Event: ${state} - ${audioFile || 'Unknown'}`);
  }
  
  getLifecycleReport(): {
    sessionDuration: number;
    totalEvents: number;
    completionRate: number;
    averagePlaybackDuration: number;
    sessionStats: typeof this.sessionStats;
  } {
    const sessionDuration = this.lifecycleEvents.length > 0 
      ? Date.now() - this.lifecycleEvents[0].timestamp 
      : 0;
    
    const completionRate = this.sessionStats.totalStarted > 0 
      ? this.sessionStats.totalCompleted / this.sessionStats.totalStarted 
      : 0;
    
    const averagePlaybackDuration = this.sessionStats.totalCompleted > 0 
      ? this.sessionStats.totalPlaybackTime / this.sessionStats.totalCompleted 
      : 0;
    
    return {
      sessionDuration,
      totalEvents: this.lifecycleEvents.length,
      completionRate,
      averagePlaybackDuration,
      sessionStats: { ...this.sessionStats }
    };
  }
  
  getEventTimeline(): Array<{
    timestamp: number;
    state: string;
    audioFile: string | null;
    duration?: number;
  }> {
    return [...this.lifecycleEvents];
  }
}
```

## Error Handling in Lifecycle

Handle errors and edge cases throughout the audio lifecycle:

```typescript
class AudioLifecycleErrorHandler {
  private errorCount: number = 0;
  private maxErrors: number = 5;
  
  constructor(channel: number = 0) {
    this.setupErrorHandling(channel);
  }
  
  private setupErrorHandling(channel: number): void {
    // Monitor for lifecycle anomalies
    
    // Detect if audio fails to start
    let expectingStart = false;
    
    onQueueChange(channel, (snapshot) => {
      if (snapshot.totalItems > 0 && snapshot.currentlyPlaying) {
        expectingStart = true;
        
        // Audio should start within reasonable time
        setTimeout(() => {
          if (expectingStart) {
            this.handleStartTimeout(snapshot.currentlyPlaying);
          }
        }, 5000); // 5 second timeout
      }
    });
    
    onAudioStart(channel, () => {
      expectingStart = false; // Audio started successfully
    });
    
    // Detect if progress stops updating
    let lastProgressTime = 0;
    let progressStalled = false;
    
    onAudioProgress(channel, (info) => {
      const now = Date.now();
      
      if (lastProgressTime > 0) {
        const timeSinceLastProgress = now - lastProgressTime;
        
        if (timeSinceLastProgress > 2000 && !progressStalled) {
          // Progress hasn't updated in 2 seconds
          this.handleProgressStall(info.fileName);
          progressStalled = true;
        }
      }
      
      lastProgressTime = now;
      progressStalled = false;
    });
    
    // Detect unexpected completions
    onAudioComplete(channel, (info) => {
      if (info.playbackDuration < 1000 && !info.wasInterrupted) {
        // Audio completed very quickly, might be an error
        this.handleSuspiciousCompletion(info);
      }
    });
  }
  
  private handleStartTimeout(fileName: string | null): void {
    this.errorCount++;
    console.error(`❌ Audio failed to start within timeout: ${fileName}`);
    
    if (this.errorCount >= this.maxErrors) {
      this.handleCriticalError('Too many start failures');
    }
  }
  
  private handleProgressStall(fileName: string): void {
    this.errorCount++;
    console.error(`❌ Audio progress stalled: ${fileName}`);
    
    // Maybe try to restart playback
    this.attemptRecovery(fileName);
  }
  
  private handleSuspiciousCompletion(info: AudioCompleteInfo): void {
    this.errorCount++;
    console.error(`❌ Suspicious completion: ${info.fileName} (${info.playbackDuration}ms)`);
    
    // Maybe the file was corrupted or very short
  }
  
  private attemptRecovery(fileName: string): void {
    console.log(`🔄 Attempting recovery for ${fileName}`);
    // Recovery logic - maybe restart the channel or skip to next
  }
  
  private handleCriticalError(reason: string): void {
    console.error(`💥 Critical audio system error: ${reason}`);
    // Maybe disable audio system or show error to user
  }
  
  getErrorCount(): number {
    return this.errorCount;
  }
  
  resetErrors(): void {
    this.errorCount = 0;
    console.log('✨ Error count reset');
  }
}
```

## Audio Loading States and Error Handling

Track loading states and handle various error conditions:

```typescript
enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading', 
  LOADED = 'loaded',
  ERROR = 'error',
  TIMEOUT = 'timeout'
}

class AudioLoadingTracker {
  private loadingStates: Map<string, LoadingState> = new Map();
  private loadingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly LOAD_TIMEOUT = 10000; // 10 seconds
  
  constructor(channel: number = 0) {
    this.setupLoadingTracking(channel);
  }
  
  private setupLoadingTracking(channel: number): void {
    // Track when audio is queued (starts loading)
    onQueueChange(channel, (snapshot) => {
      snapshot.items.forEach(item => {
        if (!this.loadingStates.has(item.fileName)) {
          this.setLoadingState(item.fileName, LoadingState.LOADING);
          this.startLoadingTimeout(item.fileName);
        }
      });
    });
    
    // Track successful loads
    onAudioStart(channel, (info) => {
      this.setLoadingState(info.fileName, LoadingState.LOADED);
      this.clearLoadingTimeout(info.fileName);
    });
    
    // Track completion (cleanup)
    onAudioComplete(channel, (info) => {
      // Clean up after a delay to allow for UI updates
      setTimeout(() => {
        this.cleanupLoadingState(info.fileName);
      }, 1000);
    });
  }
  
  private setLoadingState(fileName: string, state: LoadingState): void {
    const oldState = this.loadingStates.get(fileName);
    this.loadingStates.set(fileName, state);
    
    console.log(`📂 Loading: ${fileName} - ${oldState || 'UNKNOWN'} → ${state}`);
    
    // Trigger UI updates
    this.notifyLoadingStateChange(fileName, state);
  }
  
  private startLoadingTimeout(fileName: string): void {
    const timeout = setTimeout(() => {
      const currentState = this.loadingStates.get(fileName);
      if (currentState === LoadingState.LOADING) {
        this.setLoadingState(fileName, LoadingState.TIMEOUT);
        this.handleLoadingTimeout(fileName);
      }
    }, this.LOAD_TIMEOUT);
    
    this.loadingTimeouts.set(fileName, timeout);
  }
  
  private clearLoadingTimeout(fileName: string): void {
    const timeout = this.loadingTimeouts.get(fileName);
    if (timeout) {
      clearTimeout(timeout);
      this.loadingTimeouts.delete(fileName);
    }
  }
  
  private handleLoadingTimeout(fileName: string): void {
    console.error(`⏱️ Loading timeout for: ${fileName}`);
    // Could show user notification, try alternate sources, etc.
  }
  
  private cleanupLoadingState(fileName: string): void {
    this.loadingStates.delete(fileName);
    this.clearLoadingTimeout(fileName);
  }
  
  private notifyLoadingStateChange(fileName: string, state: LoadingState): void {
    // Update UI based on loading state
    const event = new CustomEvent('audioLoadingStateChange', {
      detail: { fileName, state }
    });
    document.dispatchEvent(event);
  }
  
  // Public API
  getLoadingState(fileName: string): LoadingState {
    return this.loadingStates.get(fileName) || LoadingState.IDLE;
  }
  
  getAllLoadingStates(): Map<string, LoadingState> {
    return new Map(this.loadingStates);
  }
  
  isLoading(fileName: string): boolean {
    return this.getLoadingState(fileName) === LoadingState.LOADING;
  }
  
  hasError(fileName: string): boolean {
    const state = this.getLoadingState(fileName);
    return state === LoadingState.ERROR || state === LoadingState.TIMEOUT;
  }
}
```

## Browser Compatibility and Network Error Handling

Handle browser-specific issues and network problems:

```typescript
class AudioCompatibilityHandler {
  private supportedFormats: string[] = [];
  private networkErrors: number = 0;
  private readonly MAX_NETWORK_ERRORS = 3;
  
  constructor() {
    this.detectSupportedFormats();
    this.setupNetworkErrorHandling();
  }
  
  private detectSupportedFormats(): void {
    const audio = new Audio();
    const formats = [
      { ext: 'mp3', type: 'audio/mpeg' },
      { ext: 'wav', type: 'audio/wav' },
      { ext: 'ogg', type: 'audio/ogg' },
      { ext: 'm4a', type: 'audio/mp4' },
      { ext: 'webm', type: 'audio/webm' }
    ];
    
    this.supportedFormats = formats
      .filter(format => audio.canPlayType(format.type) !== '')
      .map(format => format.ext);
    
    console.log('🎵 Supported audio formats:', this.supportedFormats);
  }
  
  private setupNetworkErrorHandling(): void {
    // Monitor for network-related failures
    let consecutiveFailures = 0;
    
    onQueueChange(0, (snapshot) => {
      // Reset failure count on successful queue changes
      if (snapshot.totalItems > 0) {
        consecutiveFailures = 0;
      }
    });
    
    // This would need to be implemented via actual error detection
    // since onAudioError doesn't exist yet
    this.simulateNetworkErrorDetection();
  }
  
  private simulateNetworkErrorDetection(): void {
    // This is a placeholder - in reality you'd detect network errors
    // through various means like monitoring for stalled progress,
    // failed audio starts, etc.
    
    let lastSuccessfulStart = Date.now();
    
    onAudioStart(0, () => {
      lastSuccessfulStart = Date.now();
      this.networkErrors = 0; // Reset on success
    });
    
    // Check for potential network issues
    setInterval(() => {
      const timeSinceLastSuccess = Date.now() - lastSuccessfulStart;
      
      // If no successful starts in a while and we have queued items
      if (timeSinceLastSuccess > 30000) { // 30 seconds
        const snapshot = getQueueSnapshot(0);
        if (snapshot.totalItems > 0 && !snapshot.currentlyPlaying) {
          this.handlePotentialNetworkIssue();
        }
      }
    }, 10000); // Check every 10 seconds
  }
  
  private handlePotentialNetworkIssue(): void {
    this.networkErrors++;
    console.warn(`🌐 Potential network issue detected (${this.networkErrors}/${this.MAX_NETWORK_ERRORS})`);
    
    if (this.networkErrors >= this.MAX_NETWORK_ERRORS) {
      this.handleNetworkFailure();
    }
  }
  
  private handleNetworkFailure(): void {
    console.error('🚫 Network failure detected - audio system degraded');
    
    // Show user notification
    this.showNetworkErrorNotification();
    
    // Maybe switch to lower quality audio or cached content
    this.enableOfflineMode();
  }
  
  private showNetworkErrorNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'audio-network-error';
    notification.innerHTML = `
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span>Network issues detected. Audio quality may be reduced.</span>
        <button onclick="this.parentElement.parentElement.remove()">✖️</button>
      </div>
    `;
    document.body.appendChild(notification);
  }
  
  private enableOfflineMode(): void {
    console.log('🔄 Switching to offline mode...');
    // Implementation would depend on your caching strategy
  }
  
  // Public API
  isFormatSupported(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return this.supportedFormats.includes(extension);
  }
  
  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }
  
  getNetworkErrorCount(): number {
    return this.networkErrors;
  }
  
  resetNetworkErrors(): void {
    this.networkErrors = 0;
    console.log('✅ Network error count reset');
  }
}
```

## Performance Monitoring and Memory Management

Monitor performance and manage memory usage:

```typescript
class AudioPerformanceMonitor {
  private memoryUsage: number[] = [];
  private performanceMetrics: Map<string, number> = new Map();
  private readonly MAX_MEMORY_SAMPLES = 100;
  
  constructor() {
    this.setupPerformanceMonitoring();
  }
  
  private setupPerformanceMonitoring(): void {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 5000); // Every 5 seconds
    }
    
    // Monitor audio performance
    onAudioStart(0, (info) => {
      this.recordPerformanceMetric('audio_start_time', Date.now());
    });
    
    onAudioComplete(0, (info) => {
      const startTime = this.performanceMetrics.get('audio_start_time');
      if (startTime) {
        const loadTime = Date.now() - startTime;
        this.recordPerformanceMetric('audio_load_duration', loadTime);
        console.log(`📊 Audio load time: ${loadTime}ms for ${info.fileName}`);
      }
    });
  }
  
  private recordMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / (1024 * 1024);
      
      this.memoryUsage.push(usedMB);
      
      // Keep only recent samples
      if (this.memoryUsage.length > this.MAX_MEMORY_SAMPLES) {
        this.memoryUsage.shift();
      }
      
      // Check for memory leaks
      this.checkForMemoryLeaks(usedMB);
    }
  }
  
  private checkForMemoryLeaks(currentUsage: number): void {
    if (this.memoryUsage.length < 10) return;
    
    const recentAverage = this.memoryUsage.slice(-10).reduce((a, b) => a + b) / 10;
    const oldAverage = this.memoryUsage.slice(0, 10).reduce((a, b) => a + b) / 10;
    
    const growthRate = (recentAverage - oldAverage) / oldAverage;
    
    if (growthRate > 0.5) { // 50% increase
      console.warn(`🧠 Potential memory leak detected: ${growthRate * 100}% increase`);
      this.handleMemoryWarning();
    }
  }
  
  private handleMemoryWarning(): void {
    console.log('🔄 Attempting memory cleanup...');
    
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    // Clear old performance metrics
    this.performanceMetrics.clear();
    
    // Could also stop non-essential audio processing
  }
  
  private recordPerformanceMetric(name: string, value: number): void {
    this.performanceMetrics.set(name, value);
  }
  
  // Public API
  getMemoryUsage(): number[] {
    return [...this.memoryUsage];
  }
  
  getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }
  
  getPerformanceReport(): object {
    const avgMemory = this.memoryUsage.length > 0 
      ? this.memoryUsage.reduce((a, b) => a + b) / this.memoryUsage.length 
      : 0;
    
    return {
      averageMemoryUsage: avgMemory,
      currentMemoryUsage: this.getCurrentMemoryUsage(),
      memoryTrend: this.calculateMemoryTrend(),
      performanceMetrics: Object.fromEntries(this.performanceMetrics)
    };
  }
  
  private calculateMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryUsage.length < 2) return 'stable';
    
    const recent = this.memoryUsage.slice(-5);
    const older = this.memoryUsage.slice(-10, -5);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b) / older.length;
    
    const threshold = 0.05; // 5% threshold
    
    if (recentAvg > olderAvg * (1 + threshold)) return 'increasing';
    if (recentAvg < olderAvg * (1 - threshold)) return 'decreasing';
    return 'stable';
  }
}
```

## Complete Lifecycle Manager

Combine all lifecycle management into one comprehensive system:

```typescript
class AudioLifecycleManager {
  private errorHandler: AudioLifecycleErrorHandler;
  private loadingTracker: AudioLoadingTracker;
  private compatibilityHandler: AudioCompatibilityHandler;
  private performanceMonitor: AudioPerformanceMonitor;
  
  constructor(channel: number = 0) {
    this.errorHandler = new AudioLifecycleErrorHandler(channel);
    this.loadingTracker = new AudioLoadingTracker(channel);
    this.compatibilityHandler = new AudioCompatibilityHandler();
    this.performanceMonitor = new AudioPerformanceMonitor();
    
    this.setupUnifiedReporting();
  }
  
  private setupUnifiedReporting(): void {
    // Generate comprehensive reports periodically
    setInterval(() => {
      this.generateHealthReport();
    }, 30000); // Every 30 seconds
  }
  
  private generateHealthReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      errors: {
        count: this.errorHandler.getErrorCount(),
        networkErrors: this.compatibilityHandler.getNetworkErrorCount()
      },
      loading: {
        activeStates: Array.from(this.loadingTracker.getAllLoadingStates().entries())
      },
      compatibility: {
        supportedFormats: this.compatibilityHandler.getSupportedFormats()
      },
      performance: this.performanceMonitor.getPerformanceReport()
    };
    
    console.log('📋 Audio System Health Report:', report);
    
    // Could send to analytics or monitoring service
    this.sendHealthReport(report);
  }
  
  private sendHealthReport(report: object): void {
    // Placeholder for sending reports to monitoring service
    // In a real application, you might send this to your analytics platform
  }
  
  // Public API for manual intervention
  resetErrorCounts(): void {
    this.errorHandler.resetErrors();
    this.compatibilityHandler.resetNetworkErrors();
    console.log('🔄 All error counts reset');
  }
  
  getSystemHealth(): 'healthy' | 'warning' | 'critical' {
    const errorCount = this.errorHandler.getErrorCount();
    const networkErrors = this.compatibilityHandler.getNetworkErrorCount();
    const memoryTrend = this.performanceMonitor.getPerformanceReport() as any;
    
    if (errorCount >= 5 || networkErrors >= 3 || memoryTrend.memoryTrend === 'increasing') {
      return 'critical';
    } else if (errorCount >= 2 || networkErrors >= 1) {
      return 'warning';  
    } else {
      return 'healthy';
    }
  }
  
  attemptSystemRecovery(): void {
    console.log('🚑 Attempting system recovery...');
    
    // Reset error counts
    this.resetErrorCounts();
    
    // Clear any stuck audio
    stopAllAudioInChannel(0);
    
    // Force memory cleanup
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    console.log('✅ System recovery completed');
  }
}
```

## Next Steps

Now that you understand the complete audio lifecycle, explore:

- **[Performance & Memory](./performance-memory.md)** - Optimization strategies for the entire lifecycle
- **[API Reference](../api-reference/queue-management)** - Detailed function documentation
- **[Examples](../examples/basic-usage)** - Real-world lifecycle management patterns
- **[Advanced Features](../advanced/volume-ducking)** - Complex lifecycle scenarios 