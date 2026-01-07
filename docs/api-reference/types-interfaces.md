# Types & Interfaces

Complete TypeScript definitions for all types and interfaces used in the audio-channel-queue package.

## Constants

### MAX_CHANNELS

Maximum number of audio channels allowed to prevent memory exhaustion.

```typescript
const MAX_CHANNELS: number = 64;
```

## Core Interfaces

### AudioInfo

Comprehensive audio information interface providing metadata about currently playing audio.

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
  volume: number;           // Current volume level (0-1)
}
```

### AudioQueueOptions

Configuration options for queueing audio.

```typescript
interface AudioQueueOptions {
  addToFront?: boolean;  // Whether to add this audio to the front of the queue (after currently playing)
  loop?: boolean;        // Whether the audio should loop when it finishes
  maxQueueSize?: number; // Maximum number of items allowed in the queue (defaults to unlimited)
  volume?: number;       // Volume level for this specific audio (0-1)
}
```

### QueueConfig

Global queue configuration options.

```typescript
interface QueueConfig {
  defaultMaxQueueSize?: number; // Default maximum queue size across all channels (defaults to unlimited)
  dropOldestWhenFull?: boolean; // Whether to drop oldest items when queue is full (defaults to false - reject new items)
  showQueueWarnings?: boolean;  // Whether to show warnings when queue limits are reached (defaults to true)
}
```

## Event Info Interfaces

### AudioStartInfo

Information provided when an audio file starts playing.

```typescript
interface AudioStartInfo {
  channelNumber: number; // Channel number where the audio is starting
  duration: number;      // Total audio duration in milliseconds
  fileName: string;      // Extracted filename from the source URL
  src: string;           // Audio file source URL
}
```

### AudioCompleteInfo

Information provided when an audio file completes playback.

```typescript
interface AudioCompleteInfo {
  channelNumber: number;    // Channel number where the audio completed
  fileName: string;         // Extracted filename from the source URL
  remainingInQueue: number; // Number of audio files remaining in the queue after completion
  src: string;              // Audio file source URL
}
```

### AudioErrorInfo

Information about an audio error that occurred.

```typescript
interface AudioErrorInfo {
  channelNumber: number;     // Channel number where the error occurred
  error: Error;              // The actual error object that was thrown
  errorType: AudioErrorType; // Categorized type of error for handling different scenarios
  fileName: string;          // Extracted filename from the source URL
  remainingInQueue: number;  // Number of audio files remaining in the queue after this error
  retryAttempt?: number;     // Current retry attempt number (if retrying is enabled)
  src: string;               // Audio file source URL that failed
  timestamp: number;         // Unix timestamp when the error occurred
}
```

## Queue Management Interfaces

### QueueItem

Information about a single item in an audio queue.

```typescript
interface QueueItem {
  duration: number;            // Total audio duration in milliseconds
  fileName: string;            // Extracted filename from the source URL
  isCurrentlyPlaying: boolean; // Whether this item is currently playing
  isLooping: boolean;          // Whether this item is set to loop
  src: string;                 // Audio file source URL
  volume: number;              // Volume level for this item (0-1)
}
```

### QueueSnapshot

Complete snapshot of a queue's current state.

```typescript
interface QueueSnapshot {
  channelNumber: number; // Channel number this snapshot represents
  currentIndex: number;  // Zero-based index of the currently playing item
  isPaused: boolean;     // Whether the current audio is paused
  items: QueueItem[];    // Array of audio items in the queue with their metadata
  totalItems: number;    // Total number of items in the queue
  volume: number;        // Current volume level for the channel (0-1)
}
```

### QueueManipulationResult

Information about a queue manipulation operation result.

```typescript
interface QueueManipulationResult {
  error?: string;               // Error message if operation failed
  success: boolean;             // Whether the operation was successful
  updatedQueue?: QueueSnapshot; // The queue snapshot after the operation (if successful)
}
```

## Volume & Ducking Interfaces

### VolumeConfig

Volume ducking configuration for channels.

```typescript
interface VolumeConfig {
  duckTransitionDuration?: number;    // Duration in milliseconds for volume duck transition (defaults to 250ms)
  duckingVolume: number;              // Volume level for all other channels when priority channel is active (0-1)
  priorityChannel: number;            // The channel number that should have priority
  priorityVolume: number;             // Volume level for the priority channel (0-1)
  restoreTransitionDuration?: number; // Duration in milliseconds for volume restore transition (defaults to 250ms)
  transitionEasing?: EasingType;      // Easing function for volume transitions (defaults to 'ease-out')
}
```

### FadeConfig

Configuration for fade transitions.

```typescript
interface FadeConfig {
  duration: number;        // Duration in milliseconds for the fade transition
  pauseCurve: EasingType;  // Easing curve to use when pausing (fading out)
  resumeCurve: EasingType; // Easing curve to use when resuming (fading in)
}
```

## Error Handling Interfaces

### RetryConfig

Configuration for automatic retry behavior when audio fails to load or play.

```typescript
interface RetryConfig {
  baseDelay: number;           // Initial delay in milliseconds before first retry attempt
  enabled: boolean;            // Whether automatic retries are enabled for this channel
  exponentialBackoff: boolean; // Whether to use exponential backoff (doubling delay each retry)
  fallbackUrls: string[];      // Alternative URLs to try if the primary source fails
  maxRetries: number;          // Maximum number of retry attempts before giving up
  skipOnFailure: boolean;      // Whether to skip to next track in queue if all retries fail
  timeoutMs: number;           // Timeout in milliseconds for each individual retry attempt
}
```

### ErrorRecoveryOptions

Configuration options for error recovery mechanisms.

```typescript
interface ErrorRecoveryOptions {
  autoRetry: boolean;            // Whether to automatically retry failed audio loads/plays
  fallbackToNextTrack: boolean;  // Whether to automatically skip to next track when current fails
  logErrorsToAnalytics: boolean; // Whether to send error data to analytics systems
  preserveQueueOnError: boolean; // Whether to maintain queue integrity when errors occur
  showUserFeedback: boolean;     // Whether to display user-visible error feedback
}
```

## Enums

### AudioErrorType

Types of audio errors that can occur.

```typescript
enum AudioErrorType {
  Abort = 'abort',
  Decode = 'decode',
  Network = 'network',
  Permission = 'permission',
  Timeout = 'timeout',
  Unknown = 'unknown',
  Unsupported = 'unsupported'
}
```

### EasingType

Easing function types for volume transitions.

```typescript
enum EasingType {
  EaseIn = 'ease-in',
  EaseInOut = 'ease-in-out',
  EaseOut = 'ease-out',
  Linear = 'linear'
}
```

### FadeType

Fade type for pause/resume operations with integrated volume transitions.

```typescript
enum FadeType {
  Dramatic = 'dramatic',
  Gentle = 'gentle',
  Linear = 'linear'
}
```

### TimerType

Timer types for volume transitions (internal use).

```typescript
enum TimerType {
  RequestAnimationFrame = 'raf',
  Timeout = 'timeout'
}
```

## Callback Types

### ProgressCallback

Callback function type for audio progress updates.

```typescript
type ProgressCallback = (info: AudioInfo) => void;
```

### QueueChangeCallback

Callback function type for queue change notifications.

```typescript
type QueueChangeCallback = (queueSnapshot: QueueSnapshot) => void;
```

### AudioStartCallback

Callback function type for audio start notifications.

```typescript
type AudioStartCallback = (audioInfo: AudioStartInfo) => void;
```

### AudioCompleteCallback

Callback function type for audio complete notifications.

```typescript
type AudioCompleteCallback = (audioInfo: AudioCompleteInfo) => void;
```

### AudioPauseCallback

Callback function type for audio pause notifications.

```typescript
type AudioPauseCallback = (channelNumber: number, audioInfo: AudioInfo) => void;
```

### AudioResumeCallback

Callback function type for audio resume notifications.

```typescript
type AudioResumeCallback = (channelNumber: number, audioInfo: AudioInfo) => void;
```

### AudioErrorCallback

Callback function type for audio error events.

```typescript
type AudioErrorCallback = (errorInfo: AudioErrorInfo) => void;
```

## Advanced Types

### ExtendedAudioQueueChannel

Extended audio channel with queue management and callback support (internal use).

```typescript
interface ExtendedAudioQueueChannel {
  audioCompleteCallbacks: Set<AudioCompleteCallback>;   // Set of callbacks triggered when audio completes playback
  audioErrorCallbacks: Set<AudioErrorCallback>;         // Set of callbacks triggered when audio errors occur
  audioPauseCallbacks: Set<AudioPauseCallback>;         // Set of callbacks triggered when audio is paused
  audioResumeCallbacks: Set<AudioResumeCallback>;       // Set of callbacks triggered when audio is resumed
  audioStartCallbacks: Set<AudioStartCallback>;         // Set of callbacks triggered when audio starts playing
  fadeState?: ChannelFadeState;                         // Current fade state if pause/resume with fade is active
  isPaused: boolean;                                    // Whether the channel is currently paused
  isLocked?: boolean;                                   // Active operation lock to prevent race conditions
  maxQueueSize?: number;                                // Maximum allowed queue size for this channel
  progressCallbacks: Map<HTMLAudioElement | 
    typeof GLOBAL_PROGRESS_KEY, Set<ProgressCallback>>; // Map of progress callbacks keyed by audio element or global symbol
  queue: HTMLAudioElement[];                            // Array of HTMLAudioElement objects in the queue
  queueChangeCallbacks: Set<QueueChangeCallback>;       // Set of callbacks triggered when the queue changes
  retryConfig?: RetryConfig;                            // Retry configuration for failed audio loads/plays
  volume: number;                                       // Current volume level for the channel (0-1)
}
```

### ChannelFadeState

Internal fade state tracking for pause/resume with fade functionality.

```typescript
interface ChannelFadeState {
  customDuration?: number;   // The original volume level before fading began
  fadeType: FadeType;        // The type of fade being used
  isPaused: boolean;         // Whether the channel is currently paused due to fade
  isTransitioning?: boolean; // Custom duration in milliseconds if specified (overrides fade type default)
  originalVolume: number;    // Whether the channel is currently transitioning (during any fade operation) to prevent capturing intermediate volumes during rapid pause/resume toggles
}
```

## Type Guards

Utility functions for type checking and validation.

```typescript
// Check if a value is a valid volume level
function isValidVolume(value: any): value is number {
  return typeof value === 'number' && value >= 0 && value <= 1;
}

// Check if a value is a valid channel number
function isValidChannel(value: any): value is number {
  return typeof value === 'number' && value >= 0 && value < MAX_CHANNELS && Number.isInteger(value);
}

// Check if a value is a valid EasingType
function isValidEasingType(value: any): value is EasingType {
  return Object.values(EasingType).includes(value);
}

// Check if a value is a valid FadeType
function isValidFadeType(value: any): value is FadeType {
  return Object.values(FadeType).includes(value);
}
```

## Next Steps

- See [API Reference](./quick-reference.md) for using these types
- Explore [Event Listeners](./event-listeners.md) for callback usage
- Learn about [Error Handling](./error-handling.md) for error types

This completes the comprehensive **Types & Interfaces** documentation! 🎉 