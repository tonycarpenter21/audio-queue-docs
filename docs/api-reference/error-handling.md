---
sidebar_position: 5
title: Error Handling
description: Functions for managing audio errors, retries, and recovery strategies
---

# Error Handling

Comprehensive error handling and recovery system for audio playback failures.

## API Reference

### onAudioError

Listen for audio errors on a specific channel.

#### Syntax

```typescript
onAudioError(channelNumber: number = 0, callback: AudioErrorCallback): void
```

#### AudioErrorInfo Properties

```typescript
interface AudioErrorInfo {
  channelNumber: number;
  src: string;
  fileName: string;
  error: Error;
  errorType: AudioErrorType;
  timestamp: number;
  retryAttempt?: number;
  remainingInQueue: number;
}

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

#### Examples

```typescript
import { onAudioError } from 'audio-channel-queue';

// Basic error handling
onAudioError(0, (errorInfo) => {
  console.error(`Audio error on channel ${errorInfo.channelNumber}`);
  console.error(`Failed to load: ${errorInfo.src}`);
  console.error(`Error: ${errorInfo.error.message}`);
});

// Advanced error handling with user notification
onAudioError(0, (errorInfo) => {
  // Log error details
  console.error('Audio playback failed:', errorInfo);
  console.error(`Error type: ${errorInfo.errorType}`);
  
  // Notify user based on error type
  if (errorInfo.errorType === 'network') {
    showNotification({
      type: 'error',
      message: 'Network error. Please check your connection.',
      action: 'retry',
      onAction: () => retryFailedAudio(errorInfo.channelNumber)
    });
  } else if (errorInfo.errorType === 'unsupported') {
    showNotification({
      type: 'error',
      message: `Format not supported: ${errorInfo.fileName}`
    });
  }
  
  // Track error analytics
  analytics.track('audio_error', {
    src: errorInfo.src,
    fileName: errorInfo.fileName,
    errorType: errorInfo.errorType,
    error: errorInfo.error.message,
    retryAttempt: errorInfo.retryAttempt
  });
});
```

### offAudioError

Remove audio error listeners from a channel.

#### Syntax

```typescript
offAudioError(channelNumber?: number = 0, callback?: AudioErrorCallback): void
```

#### Examples

```typescript
import { offAudioError } from 'audio-channel-queue';

// Remove all error listeners from default channel
offAudioError();

// Remove all error listeners from channel 1
offAudioError(1);

// Remove specific callback only
const errorHandler = (errorInfo) => console.error(errorInfo);
onAudioError(0, errorHandler);
// Later...
offAudioError(0, errorHandler); // Remove only this specific handler
```

### setErrorRecovery

Configure automatic error recovery strategies.

#### Syntax

```typescript
setErrorRecovery(options: ErrorRecoveryOptions): void
```

#### ErrorRecoveryOptions

```typescript
interface ErrorRecoveryOptions {
  autoRetry: boolean;              // Enable automatic retry on failure
  fallbackToNextTrack: boolean;    // Skip to next track on error
  logErrorsToAnalytics: boolean;   // Log errors to analytics
  preserveQueueOnError: boolean;   // Keep queue intact on error
  showUserFeedback: boolean;       // Show user feedback on errors
}
```

#### Examples

```typescript
import { setErrorRecovery } from 'audio-channel-queue';

// Basic error recovery
setErrorRecovery({
  autoRetry: true,
  fallbackToNextTrack: true,
  logErrorsToAnalytics: true,
  preserveQueueOnError: true,
  showUserFeedback: true,
});

// Disable auto-recovery for manual handling
setErrorRecovery({
  autoRetry: false,
  fallbackToNextTrack: false,
  logErrorsToAnalytics: true,
  preserveQueueOnError: true,
  showUserFeedback: true
});
```

### getErrorRecovery

Get current error recovery configuration.

#### Syntax

```typescript
getErrorRecovery(): ErrorRecoveryOptions
```

#### ErrorRecoveryOptions

```typescript
interface ErrorRecoveryOptions {
  autoRetry: boolean;              // Enable automatic retry on failure
  fallbackToNextTrack: boolean;    // Skip to next track on error
  logErrorsToAnalytics: boolean;   // Log errors to analytics
  preserveQueueOnError: boolean;   // Keep queue intact on error
  showUserFeedback: boolean;       // Show user feedback on errors
}
```

#### Examples

```typescript
import { getErrorRecovery } from 'audio-channel-queue';

// Check current settings
const recovery = getErrorRecovery();
console.log(`Auto retry: ${recovery.autoRetry}`);
console.log(`Show user feedback: ${recovery.showUserFeedback}`);
console.log(`Log to analytics: ${recovery.logErrorsToAnalytics}`);

// Conditionally enable features
if (!getErrorRecovery().autoRetry) {
  console.log('Warning: Auto-retry is disabled');
}
```

### setRetryConfig

Configure retry behavior for specific audio URLs or patterns.

#### Syntax

```typescript
setRetryConfig(config: RetryConfig): void
```

#### RetryConfig

```typescript
interface RetryConfig = {
  baseDelay: number;           // 1 second initial delay between retries
  enabled: boolean;            // Retry functionality is enabled by default
  exponentialBackoff: boolean; // Use exponential backoff (1s, 2s, 4s, 8s...)
  fallbackUrls: string[],      // No fallback URLs by default (newly required!)
  maxRetries: number,          // Maximum of 3 retry attempts
  skipOnFailure: boolean,      // Don't skip to next track on failure
  timeoutMs: number            // 10 second timeout for audio loading
};
```

#### Examples

```typescript
import { setRetryConfig } from 'audio-channel-queue';

// Basic retry configuration
setRetryConfig({
  baseDelay: 500,
  enabled: true,
  exponentialBackoff: true,
  fallbackUrls: [
    'https://cdn1.example.com/audio/',
    'https://cdn2.example.com/audio/'
  ],
  maxRetries: 5,
  skipOnFailure: true,
  timeoutMs: 15000
});

// Aggressive retry for critical audio
setRetryConfig({
  baseDelay: 200,
  enabled: true,
  exponentialBackoff: false, // Linear retry for faster attempts
  fallbackUrls: [
    'https://cdn1.example.com/audio/',
    'https://cdn2.example.com/audio/'
  ],
  maxRetries: 10,
  skipOnFailure: false, // Don't skip, keep trying
  timeoutMs: 30000
});
```

### getRetryConfig

Get current retry configuration.

#### Syntax

```typescript
getRetryConfig(): RetryConfig
```

#### RetryConfig

```typescript
interface RetryConfig = {
  baseDelay: number;           // 1 second initial delay between retries
  enabled: boolean;            // Retry functionality is enabled by default
  exponentialBackoff: boolean; // Use exponential backoff (1s, 2s, 4s, 8s...)
  fallbackUrls: string[],      // No fallback URLs by default (newly required!)
  maxRetries: number,          // Maximum of 3 retry attempts
  skipOnFailure: boolean,      // Don't skip to next track on failure
  timeoutMs: number            // 10 second timeout for audio loading
};
```

#### Examples

```typescript
import { getRetryConfig } from 'audio-channel-queue';

const config = getRetryConfig();

// Check settings
console.log(`Base delay: ${config.baseDelay}ms`);
console.log(`Retry enabled: ${config.enabled}`);
console.log(`Exponential backoff: ${config.exponentialBackoff}`);
console.log(`Fallback URLs: ${config.fallbackUrls.length}`);
console.log(`Max retries: ${config.maxRetries}`);
console.log(`Skip on failure: ${config.skipOnFailure}`);
console.log(`Timeout: ${config.timeoutMs}`);
```

### retryFailedAudio

Manually retry the currently failed audio in a channel.

#### Syntax

```typescript
await retryFailedAudio(channelNumber?: number = 0): Promise<boolean>
```

#### Returns

- `Promise<boolean>`: Resolves to true if retry succeeded, false otherwise

#### Examples

```typescript
import { retryFailedAudio } from 'audio-channel-queue';

// Retry failed audio on default channel
const success = await retryFailedAudio();
if (success) {
  console.log('Retry successful!');
} else {
  console.log('Retry failed');
}

// Retry on specific channel
const result = await retryFailedAudio(1);

// User-triggered retry button
document.getElementById('retry-btn').onclick = async () => {
  const success = await retryFailedAudio();
  if (!success) {
    alert('Unable to play audio. Please check your connection.');
  }
};

// Retry with error handling
async function handleRetry() {
  try {
    const success = await retryFailedAudio();
    if (!success) {
      console.log('Max retries reached');
      showErrorUI();
    }
  } catch (error) {
    console.error('Retry error:', error);
  }
}
```

## Implementation Examples

### Audio Loading Error Detection

Monitor and handle audio loading issues:

```typescript
import { 
  onQueueChange, 
  onAudioStart, 
  onAudioComplete,
  onAudioError,
  getQueueSnapshot,
  AudioErrorInfo,
  AudioErrorType
} from 'audio-channel-queue';

class AudioLoadingErrorHandler {
  private loadingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly LOAD_TIMEOUT: number = 10000; // 10 seconds
  private errorCallback?: (error: AudioErrorInfo) => void;

  constructor(errorCallback?: (error: AudioErrorInfo) => void) {
    this.errorCallback = errorCallback;
    this.setupErrorDetection();
  }

  private setupErrorDetection(): void {
    // Use the package's built-in error handling
    onAudioError(0, (errorInfo: AudioErrorInfo) => {
      console.error('Audio error detected:', errorInfo);
      
      if (this.errorCallback) {
        this.errorCallback(errorInfo);
      }
    });

    // Track when audio is queued but fails to start
    onQueueChange(0, (snapshot) => {
      snapshot.items.forEach(item => {
        if (!item.isCurrentlyPlaying && !this.loadingTimeouts.has(item.fileName)) {
          this.startLoadingTimeout(item.fileName);
        }
      });
    });

    // Clear timeouts when audio successfully starts
    onAudioStart(0, (info) => {
      this.clearLoadingTimeout(info.fileName);
    });

    // Handle completed audio (cleanup)
    onAudioComplete(0, (info) => {
      this.clearLoadingTimeout(info.fileName);
    });
  }

  private startLoadingTimeout(fileName: string): void {
    const timeout = setTimeout(() => {
      this.handleLoadingTimeout(fileName);
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
    const errorInfo: AudioErrorInfo = {
      channelNumber: 0,
      error: new Error(`Audio file failed to load within ${this.LOAD_TIMEOUT}ms`),
      errorType: AudioErrorType.Timeout,
      fileName,
      remainingInQueue: 0,
      src: fileName,
      timestamp: Date.now()
    };

    console.error('Audio loading timeout:', errorInfo);
    
    if (this.errorCallback) {
      this.errorCallback(errorInfo);
    }

    this.loadingTimeouts.delete(fileName);
  }
}
```

### Network Error Handling

Handle network connectivity issues and file availability:

```typescript
import { 
  queueAudio, 
  setRetryConfig, 
  setErrorRecovery,
  onAudioError,
  AudioQueueOptions,
  AudioErrorInfo,
  AudioErrorType
} from 'audio-channel-queue';

class NetworkAwareAudioManager {
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: Array<{ audioUrl: string; channel: number; options?: AudioQueueOptions }> = [];

  constructor() {
    this.setupNetworkMonitoring();
    this.configurePackageRetries();
  }

  private setupNetworkMonitoring(): void {
    // Monitor network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network connection restored');
      this.retryFailedAudio();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network connection lost');
      this.handleOfflineMode();
    });
  }

  private configurePackageRetries(): void {
    // Use the package's built-in retry system
    setRetryConfig({
      enabled: true,
      maxRetries: 3,
      exponentialBackoff: true,
      baseDelay: 1000,
      fallbackUrls: [],
      skipOnFailure: false,
      timeoutMs: 10000
    });

    setErrorRecovery({
      autoRetry: true,
      fallbackToNextTrack: false,
      logErrorsToAnalytics: false,
      preserveQueueOnError: true,
      showUserFeedback: false
    });

    // Listen for errors that the package couldn't resolve
    onAudioError(0, (errorInfo: AudioErrorInfo) => {
      if (errorInfo.errorType === AudioErrorType.Network && !this.isOnline) {
        this.handleNetworkError(errorInfo);
      } else {
        this.handlePermanentFailure(errorInfo);
      }
    });
  }

  async queueAudioWithRetry(
    audioUrl: string, 
    channel: number = 0, 
    options?: AudioQueueOptions
  ): Promise<boolean> {
    if (!this.isOnline) {
      console.warn('Offline - queuing for retry when online');
      this.queueForRetry(audioUrl, channel, options);
      return false;
    }

    try {
      await queueAudio(audioUrl, channel, options);
      return true;
    } catch (error) {
      console.error(`Failed to queue audio: ${audioUrl}`, error);
      return false;
    }
  }

  private handleNetworkError(errorInfo: AudioErrorInfo): void {
    if (!this.isOnline) {
      console.warn(`Network error while offline: ${errorInfo.fileName}`);
      this.queueForRetry(errorInfo.src, errorInfo.channelNumber);
    }
  }

  private queueForRetry(audioUrl: string, channel: number, options?: AudioQueueOptions): void {
    // Store failed requests for retry when online
    const retryItem = { audioUrl, channel, options };
    this.offlineQueue.push(retryItem);
    console.log('Queued for retry when online:', retryItem);
  }

  private async retryFailedAudio(): Promise<void> {
    // Retry any queued audio when network is restored
    console.log('Retrying failed audio requests...');
    
    const queueToRetry = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queueToRetry) {
      try {
        await queueAudio(item.audioUrl, item.channel, item.options);
        console.log(`Successfully retried: ${item.audioUrl}`);
      } catch (error) {
        console.error(`Retry failed: ${item.audioUrl}`, error);
        // Put it back in queue for next retry
        this.offlineQueue.push(item);
      }
    }
  }

  private handleOfflineMode(): void {
    // Switch to offline mode - maybe use cached audio
    console.log('Switching to offline mode');
  }

  private handlePermanentFailure(errorInfo: AudioErrorInfo): void {
    // Handle audio that consistently fails to load
    console.error('Permanent failure for:', errorInfo.fileName, errorInfo.error);
    this.notifyUser(`Failed to load audio: ${errorInfo.fileName}`);
  }

  private notifyUser(message: string): void {
    // Show user-friendly error message
    console.log('User notification:', message);
  }
}
```

## Error Handling Patterns

### Comprehensive Error Management

```typescript
import {
  setErrorRecovery,
  setRetryConfig,
  onAudioError,
  retryFailedAudio,
  AudioErrorInfo,
  AudioErrorType
} from 'audio-channel-queue';

class AudioErrorManager {
  constructor() {
    this.setupErrorHandling();
  }
  
  private setupErrorHandling(): void {
    // Configure recovery strategy
    setErrorRecovery({
      autoRetry: true,
      showUserFeedback: true,
      logErrorsToAnalytics: true,
      preserveQueueOnError: true,
      fallbackToNextTrack: true
    });
    
    // Configure retry settings
    setRetryConfig({
      enabled: true,
      maxRetries: 3,
      baseDelay: 1000,
      exponentialBackoff: true,
      fallbackUrls: [],
      skipOnFailure: false,
      timeoutMs: 10000
    });
    
    // Set up error listeners for all channels
    for (let i = 0; i < 4; i++) {
      onAudioError(i, (error: AudioErrorInfo) => this.handleError(error, i));
    }
  }
  
  private handleError(errorInfo: AudioErrorInfo, channel: number): void {
    console.error(`Channel ${channel} error:`, errorInfo);
    
    // Different handling based on error type
    switch (errorInfo.errorType) {
      case AudioErrorType.Network:
        this.handleNetworkError(errorInfo);
        break;
      case AudioErrorType.Permission:
        this.handlePermissionError(errorInfo);
        break;
      case AudioErrorType.Unsupported:
        this.handleUnsupportedError(errorInfo);
        break;
      case AudioErrorType.Timeout:
        this.handleTimeoutError(errorInfo);
        break;
      default:
        this.handleGenericError(errorInfo);
    }
  }
  
  private handleNetworkError(errorInfo: AudioErrorInfo): void {
    this.notifyUser('Network error. Please check your connection.');
    // Retry will be handled automatically if configured
  }
  
  private handleUnsupportedError(errorInfo: AudioErrorInfo): void {
    this.notifyUser(`Audio format not supported: ${errorInfo.fileName}`);
    // No retry for unsupported formats
  }
  
  private handleTimeoutError(errorInfo: AudioErrorInfo): void {
    this.notifyUser('Audio loading timed out. Retrying...');
    // Retry will be handled automatically
  }
  
  private handlePermissionError(errorInfo: AudioErrorInfo): void {
    this.notifyUser('Audio playback requires user interaction. Click to play.');
    // Set up click handler to retry
    document.addEventListener('click', async () => {
      try {
        await retryFailedAudio(errorInfo.channelNumber);
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }, { once: true });
  }
  
  private handleGenericError(errorInfo: AudioErrorInfo): void {
    this.notifyUser(`Failed to play audio: ${errorInfo.error.message}`);
  }
  
  private notifyUser(message: string): void {
    // Your notification implementation
    console.warn(message);
  }
  
  private logError(errorData: AudioErrorInfo): void {
    // Send to error tracking service
    console.error('Logging error:', errorData);
  }
}
```

### Network-Aware Error Handling

```typescript
// Monitor network status
window.addEventListener('online', () => {
  console.log('Connection restored');
  // Retry any failed audio
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  // Pause non-critical audio
  await pauseChannel(0); // Background music
});

// Configure retries for poor network conditions
setRetryConfig({
  enabled: true,
  maxRetries: 5,
  baseDelay: 2000,
  exponentialBackoff: true,
  fallbackUrls: [],
  skipOnFailure: false, // Keep trying on poor network
  timeoutMs: 60000 // 1 minute timeout for slow connections
});
```

## Best Practices

1. **Always set up error handlers** before queuing audio
2. **Use exponential backoff** for network-related errors
3. **Provide fallback URLs** for critical audio files
4. **Log errors** for monitoring and debugging
5. **Notify users** appropriately without being intrusive
6. **Clean up error listeners** when components unmount
