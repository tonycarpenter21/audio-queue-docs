# Types & Interfaces

Complete TypeScript definitions for all types and interfaces used in the audio-channel-queue package.

## Core Interfaces

### AudioInfo

Detailed information about currently playing audio on a channel.

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

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `audioElement` | `HTMLAudioElement` | The underlying HTML audio element |
| `currentTime` | `number` | Current playback position in milliseconds |
| `duration` | `number` | Total audio duration in milliseconds |
| `fileName` | `string` | Name of the audio file (cleaned) |
| `isLooping` | `boolean` | Whether the audio is set to loop |
| `isPaused` | `boolean` | Whether the audio is currently paused |
| `isPlaying` | `boolean` | Whether the audio is currently playing |
| `progress` | `number` | Playback progress as percentage (0.0 to 1.0) |
| `src` | `string` | Source URL of the audio file |
| `volume` | `number` | Current volume level (0.0 to 1.0) |

#### Usage Examples

```typescript
import { getCurrentAudioInfo } from 'audio-channel-queue';

const info: AudioInfo | null = getCurrentAudioInfo();
if (info) {
  console.log(`${info.fileName} - ${info.currentTime}/${info.duration}ms`);
  console.log(`Volume: ${info.volume}, Paused: ${info.isPaused}`);
}
```

### AudioOptions

Configuration options for queueing audio files.

```typescript
interface AudioOptions {
  loop?: boolean;
  priority?: boolean;
  volume?: number;
}
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `loop` | `boolean` | `false` | Whether to loop the audio when it finishes |
| `priority` | `boolean` | `false` | If true, acts like `queueAudioPriority()` |
| `volume` | `number` | `1.0` | Initial volume level (0.0 to 1.0) |

#### Usage Examples

```typescript
import { queueAudio } from 'audio-channel-queue';

// Background music with loop and reduced volume
const backgroundOptions: AudioOptions = {
  loop: true,
  volume: 0.3
};
await queueAudio('./music/ambient.mp3', 0, backgroundOptions);

// Priority announcement at full volume
const urgentOptions: AudioOptions = {
  priority: true,
  volume: 1.0
};
await queueAudio('./voice/alert.mp3', 0, urgentOptions);

// Simple sound effect with default settings
await queueAudio('./sfx/click.wav', 1, {}); // or just omit options
```

### QueueSnapshot

Complete snapshot of a channel's queue state.

```typescript
interface QueueSnapshot {
  items: QueueItem[];
  totalItems: number;
  currentlyPlaying: string | null;
  isChannelActive: boolean;
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `items` | `QueueItem[]` | Array of all items in the queue |
| `totalItems` | `number` | Total number of items in queue |
| `currentlyPlaying` | `string \| null` | Filename of currently playing audio, or null |
| `isChannelActive` | `boolean` | Whether the channel has any activity |

#### Usage Examples

```typescript
import { getQueueSnapshot } from 'audio-channel-queue';

const snapshot: QueueSnapshot = getQueueSnapshot();

console.log(`Queue has ${snapshot.totalItems} items`);
console.log(`Currently playing: ${snapshot.currentlyPlaying || 'Nothing'}`);
console.log(`Channel active: ${snapshot.isChannelActive}`);

snapshot.items.forEach((item, index) => {
  const status = item.isCurrentlyPlaying ? 'Playing' : 'Queued';
  console.log(`${item.position}. ${status}: ${item.fileName}`);
});
```

### QueueItem

Individual item within a queue.

```typescript
interface QueueItem {
  fileName: string;
  duration: number;
  isCurrentlyPlaying: boolean;
  position: number;
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `fileName` | `string` | Name of the audio file |
| `duration` | `number` | Audio duration in milliseconds |
| `isCurrentlyPlaying` | `boolean` | Whether this item is currently playing |
| `position` | `number` | Position in queue (1-based index) |

#### Usage Examples

```typescript
import { getQueueSnapshot } from 'audio-channel-queue';

const snapshot = getQueueSnapshot();

snapshot.items.forEach((item: QueueItem) => {
  const duration = Math.round(item.duration / 1000);
  const status = item.isCurrentlyPlaying ? '🔊' : '⏳';
  console.log(`${status} ${item.position}. ${item.fileName} (${duration}s)`);
});
```

## Event Info Interfaces

### AudioStartInfo

Information provided when audio starts playing.

```typescript
interface AudioStartInfo {
  audioElement: HTMLAudioElement;
  currentTime: number;
  duration: number;
  fileName: string;
  volume: number;
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `audioElement` | `HTMLAudioElement` | The HTML audio element that started |
| `currentTime` | `number` | Starting playback position (usually 0) |
| `duration` | `number` | Total duration of the audio file |
| `fileName` | `string` | Name of the audio file |
| `volume` | `number` | Volume level when playback started |

#### Usage Examples

```typescript
import { onAudioStart } from 'audio-channel-queue';

onAudioStart(0, (info: AudioStartInfo) => {
  console.log(`Started: ${info.fileName}`);
  console.log(`Duration: ${Math.round(info.duration / 1000)} seconds`);
  console.log(`Volume: ${Math.round(info.volume * 100)}%`);
});
```

### AudioCompleteInfo

Information provided when audio finishes playing.

```typescript
interface AudioCompleteInfo {
  fileName: string;
  playbackDuration: number;
  remainingInQueue: number;
  wasInterrupted: boolean;
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `fileName` | `string` | Name of the audio file that completed |
| `playbackDuration` | `number` | How long the audio actually played |
| `remainingInQueue` | `number` | Number of items left in queue |
| `wasInterrupted` | `boolean` | Whether playback was stopped before completion |

#### Usage Examples

```typescript
import { onAudioComplete } from 'audio-channel-queue';

onAudioComplete(0, (info: AudioCompleteInfo) => {
  if (info.wasInterrupted) {
    console.log(`${info.fileName} was interrupted after ${info.playbackDuration}ms`);
  } else {
    console.log(`${info.fileName} completed naturally`);
  }
  console.log(`${info.remainingInQueue} items remaining in queue`);
});
```

### AudioProgressInfo

Information provided during audio playback progress updates.

```typescript
interface AudioProgressInfo {
  currentTime: number;
  duration: number;
  fileName: string;
  progress: number;
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentTime` | `number` | Current playback position in milliseconds |
| `duration` | `number` | Total duration in milliseconds |
| `fileName` | `string` | Name of the audio file |
| `progress` | `number` | Progress as decimal (0.0 to 1.0) |

#### Usage Examples

```typescript
import { onAudioProgress } from 'audio-channel-queue';

onAudioProgress(0, (info: AudioProgressInfo) => {
  const percentage = Math.round(info.progress * 100);
  console.log(`${info.fileName}: ${percentage}%`);
  console.log(`Time: ${info.currentTime}/${info.duration}ms`);
});
```

## Utility Types

### ChannelNumber

Type alias for channel numbers.

```typescript
type ChannelNumber = number;
```

#### Usage Examples

```typescript
import { queueAudio } from 'audio-channel-queue';

const musicChannel: ChannelNumber = 0;
const sfxChannel: ChannelNumber = 1;
const voiceChannel: ChannelNumber = 2;

await queueAudio('./music/background.mp3', musicChannel);
await queueAudio('./sfx/explosion.wav', sfxChannel);
await queueAudio('./voice/dialog.mp3', voiceChannel);
```

### VolumeLevel

Type alias for volume levels with constraints.

```typescript
type VolumeLevel = number; // 0.0 to 1.0
```

#### Usage Examples

```typescript
import { setChannelVolume } from 'audio-channel-queue';

const muteVolume: VolumeLevel = 0.0;
const halfVolume: VolumeLevel = 0.5;
const maxVolume: VolumeLevel = 1.0;

setChannelVolume(0, halfVolume);
setChannelVolume(1, maxVolume);

// Volume validation helper
function setValidVolume(channel: number, volume: VolumeLevel): void {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  setChannelVolume(channel, clampedVolume);
}
```

### AudioFilePath

Type alias for audio file paths and URLs.

```typescript
type AudioFilePath = string;
```

#### Usage Examples

```typescript
import { queueAudio } from 'audio-channel-queue';

const localFile: AudioFilePath = './audio/music.mp3';
const webUrl: AudioFilePath = 'https://example.com/audio/song.mp3';
const dataUrl: AudioFilePath = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAA...';

await queueAudio(localFile, 0);
await queueAudio(webUrl, 1);
await queueAudio(dataUrl, 2);
```

## Advanced Type Patterns

### Custom Event Handlers

Define strongly-typed event handler functions.

```typescript
type AudioStartHandler = (info: AudioStartInfo) => void;
type AudioCompleteHandler = (info: AudioCompleteInfo) => void;
type AudioProgressHandler = (info: AudioProgressInfo) => void;
type QueueChangeHandler = (snapshot: QueueSnapshot) => void;

// Usage examples
const handleStart: AudioStartHandler = (info) => {
  console.log(`Started: ${info.fileName}`);
};

const handleComplete: AudioCompleteHandler = (info) => {
  console.log(`Completed: ${info.fileName}`);
};

const handleProgress: AudioProgressHandler = (info) => {
  updateProgressDisplay(info.progress);
};

const handleQueueChange: QueueChangeHandler = (snapshot) => {
  updateQueueDisplay(snapshot.items);
};
```

### Channel State Management

Create typed channel state interfaces.

```typescript
interface ChannelState {
  audioInfo: AudioInfo | null;
  isPaused: boolean;
  isActive: boolean;
  queueSnapshot: QueueSnapshot;
  volume: VolumeLevel;
}

interface MultiChannelState {
  [channelNumber: number]: ChannelState;
}

// Usage example
class AudioChannelManager {
  private channelStates: MultiChannelState = {};

  getChannelState(channel: ChannelNumber): ChannelState | null {
    return this.channelStates[channel] || null;
  }

  updateChannelState(channel: ChannelNumber, state: Partial<ChannelState>): void {
    this.channelStates[channel] = {
      ...this.channelStates[channel],
      ...state
    };
  }

  getAllChannelStates(): MultiChannelState {
    return { ...this.channelStates };
  }
}
```

### Audio Configuration Types

Create configuration interfaces for different audio scenarios.

```typescript
interface GameAudioConfig {
  music: {
    channel: ChannelNumber;
    volume: VolumeLevel;
    loop: boolean;
  };
  sfx: {
    channel: ChannelNumber;
    volume: VolumeLevel;
  };
  voice: {
    channel: ChannelNumber;
    volume: VolumeLevel;
    priority: boolean;
  };
}

// Usage example
const gameConfig: GameAudioConfig = {
  music: { channel: 0, volume: 0.4, loop: true },
  sfx: { channel: 1, volume: 0.8 },
  voice: { channel: 2, volume: 1.0, priority: true }
};
```

## Type Guards

Utility functions for type checking and validation.

```typescript
// Check if a value is a valid AudioInfo object
function isAudioInfo(value: any): value is AudioInfo {
  return value &&
    typeof value === 'object' &&
    typeof value.fileName === 'string' &&
    typeof value.currentTime === 'number' &&
    typeof value.duration === 'number' &&
    typeof value.volume === 'number' &&
    typeof value.isPlaying === 'boolean' &&
    typeof value.isPaused === 'boolean' &&
    typeof value.isLooping === 'boolean';
}

// Check if a value is a valid volume level
function isValidVolume(value: any): value is VolumeLevel {
  return typeof value === 'number' && value >= 0 && value <= 1;
}

// Check if a value is a valid channel number
function isValidChannel(value: any): value is ChannelNumber {
  return typeof value === 'number' && value >= 0 && Number.isInteger(value);
}

// Usage examples
const audioInfo = getCurrentAudioInfo(0);
if (isAudioInfo(audioInfo)) {
  // TypeScript now knows audioInfo is AudioInfo, not AudioInfo | null
  console.log(`Playing: ${audioInfo.fileName}`);
}

function setValidatedVolume(channel: number, volume: any): boolean {
  if (!isValidChannel(channel)) {
    console.error('Invalid channel number');
    return false;
  }
  
  if (!isValidVolume(volume)) {
    console.error('Invalid volume level');
    return false;
  }
  
  setChannelVolume(channel, volume);
  return true;
}
```

## Generic Types

Create reusable generic types for audio management.

```typescript
// Generic event handler type
type EventHandler<T> = (data: T) => void;

// Audio event handlers
type AudioEventHandlers = {
  onStart: EventHandler<AudioStartInfo>;
  onComplete: EventHandler<AudioCompleteInfo>;
  onProgress: EventHandler<AudioProgressInfo>;
  onQueueChange: EventHandler<QueueSnapshot>;
};

// Channel-specific configuration
interface ChannelConfig<TOptions = AudioOptions> {
  channel: ChannelNumber;
  defaultOptions: TOptions;
  eventHandlers: Partial<AudioEventHandlers>;
}

// Usage example
const musicChannelConfig: ChannelConfig = {
  channel: 0,
  defaultOptions: { loop: true, volume: 0.5 },
  eventHandlers: {
    onStart: (info) => console.log(`Music started: ${info.fileName}`),
    onComplete: (info) => console.log(`Music completed: ${info.fileName}`)
  }
};
```

This completes the comprehensive **Types & Interfaces** documentation! 🎉 