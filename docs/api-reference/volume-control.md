# Volume Control

Control audio levels across individual channels or all channels simultaneously. For automated volume control, check out the [Volume Ducking](../advanced/volume-ducking.md) documentation.

## setChannelVolume

Sets the volume for a specific audio channel.

### Syntax

```typescript
setChannelVolume(
  channelNumber: number, 
  volume: number,
  transitionDuration?: number,
  easing?: EasingType
): Promise<void>
```

### Parameters

- `channelNumber` (number): The channel number (0-based index)
- `volume` (number): Volume level between 0.0 (muted) and 1.0 (full volume)
- `transitionDuration` (number, optional): Smooth transition duration in milliseconds
- `easing` (EasingType, optional): Easing function for smooth transitions ('linear' | 'ease-in' | 'ease-out' | 'ease-in-out')

### Easing Type Properties
```typescript
enum EasingType {
  EaseIn = 'ease-in',
  EaseInOut = 'ease-in-out',
  EaseOut = 'ease-out',
  Linear = 'linear'
}
```

### Examples

```typescript
import { setChannelVolume } from 'audio-channel-queue';

// Set channel 0 to half volume
await setChannelVolume(0, 0.5);

// Mute channel 1
await setChannelVolume(1, 0);

// Set channel 2 to full volume
await setChannelVolume(2, 1.0);

// Smooth volume transitions with easing
await setChannelVolume(0, 0.3, 500, EasingType.EaseOut); // Fade to 30% over 500ms
await setChannelVolume(1, 1.0, 200, EasingType.EaseIn);  // Quick fade to 100%

class GameAudioManager {
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;

  async updateMusicVolume(volume: number): Promise<void> {
    this.musicVolume = volume;
    await setChannelVolume(0, volume); // Music channel
  }

  async updateSFXVolume(volume: number): Promise<void> {
    this.sfxVolume = volume;
    await setChannelVolume(1, volume); // SFX channel
  }

  async muteAllAudio(): Promise<void> {
    await setChannelVolume(0, 0); // Mute music
    await setChannelVolume(1, 0); // Mute SFX
  }

  async restoreVolumes(): Promise<void> {
    await setChannelVolume(0, this.musicVolume);
    await setChannelVolume(1, this.sfxVolume);
  }
}
```

## getChannelVolume

Retrieves the current volume level for a specific channel.

### Syntax

```typescript
getChannelVolume(channelNumber?: number = 0): number
```

### Returns

- `number`: Current volume level (0.0 to 1.0)

### Examples

```typescript
import { getChannelVolume, setChannelVolume } from 'audio-channel-queue';

// Set and then get volume
await setChannelVolume(0, 0.75);
const currentVolume = getChannelVolume(0);
console.log(currentVolume); // 0.75

// Check if channel is muted
if (getChannelVolume(1) === 0) {
  console.log('Channel 1 is muted');
}
```


## setAllChannelsVolume

Sets the same volume level for all active audio channels.

### Syntax

```typescript
setAllChannelsVolume(volume: number): Promise<void>
```

### Parameters

- `volume` (number): Volume level between 0.0 (muted) and 1.0 (full volume)

### Examples

```typescript
import { setAllChannelsVolume, getChannelVolume } from 'audio-channel-queue';

// Set all channels to 50% volume
await setAllChannelsVolume(0.5);

// Mute all channels
await setAllChannelsVolume(0);

// Full volume for all channels
await setAllChannelsVolume(1.0);

// Verify the change
console.log('Channel 0 volume:', getChannelVolume(0)); // 1.0
console.log('Channel 1 volume:', getChannelVolume(1)); // 1.0
```

## getAllChannelsVolume

Gets the volume levels for all channels.

### Syntax

```typescript
getAllChannelsVolume(): number[]
```

### Returns

- `number[]`: Array of volume levels (0.0 to 1.0) for each channel

### Examples

```typescript
import { getAllChannelsVolume } from 'audio-channel-queue';

// Get all channel volumes
const volumes = getAllChannelsVolume();
volumes.forEach((volume, index) => {
  console.log(`Channel ${index}: ${Math.round(volume * 100)}%`);
});

// Check if any channel is muted
const hasMutedChannel = getAllChannelsVolume().some(vol => vol === 0);
```

## fadeVolume

Smoothly transitions volume for a specific channel over time.

### Syntax

```typescript
fadeVolume(
  channelNumber: number,
  targetVolume: number,
  duration?: number,
  easing?: EasingType
): Promise<void>
```

### Parameters

- `channelNumber` (number): The channel number to fade
- `targetVolume` (number): Target volume level (0-1)
- `duration` (number, optional): Fade duration in milliseconds (defaults to 250)
- `easing` (EasingType, optional): Easing function type (defaults to 'ease-out')

### Examples

```typescript
import { fadeVolume } from 'audio-channel-queue';

// Fade out over 1 second
await fadeVolume(0, 0, 1000, EasingType.EaseIn);

// Fade in over 500ms
await fadeVolume(0, 1, 500, EasingType.EaseOut);

// Cross-fade between channels
async function crossFade(fromChannel: number, toChannel: number): Promise<void> {
  await Promise.all([
    fadeVolume(fromChannel, 0, 800, EasingType.EaseIn),
    fadeVolume(toChannel, 1, 800, EasingType.EaseOut)
  ]);
}
```

## transitionVolume

Low-level function for smooth volume transitions with full control.

### Syntax

```typescript
transitionVolume(
  channelNumber: number,
  targetVolume: number,
  duration?: number,
  easing?: EasingType
): Promise<void>
```

### Parameters

- `channelNumber` (number): The channel number to transition
- `targetVolume` (number): Target volume level (0-1)
- `duration` (number, optional): Transition duration in milliseconds (defaults to 250)
- `easing` (EasingType, optional): Easing function type (defaults to 'ease-out')

### Examples

```typescript
import { transitionVolume } from 'audio-channel-queue';

// Smooth duck to 20% over 300ms
await transitionVolume(0, 0.2, 300, EasingType.EaseIn);

// Quick fade to 80% 
await transitionVolume(1, 0.8, 100, EasingType.Linear);
```

> **Note**: `fadeVolume()` is the preferred alias for this function.

## getFadeConfig

Gets the predefined configuration for fade types.

### Syntax

```typescript
getFadeConfig(fadeType: FadeType): FadeConfig
```

### Parameters

- `fadeType` (FadeType): 'dramatic' | 'gentle' | 'linear'

### Returns

```typescript
interface FadeConfig {
  duration: number;        // Duration in milliseconds for the fade transition
  pauseCurve: EasingType;  // Easing curve to use when pausing (fading out)
  resumeCurve: EasingType; // Easing curve to use when resuming (fading in)
}
```

### Examples

```typescript
import { getFadeConfig } from 'audio-channel-queue';

// Get gentle fade configuration
const config = getFadeConfig('gentle');
console.log(`Duration: ${config.duration}ms`);
console.log(`Pause curve: ${config.pauseCurve}`);
console.log(`Resume curve: ${config.resumeCurve}`);

// Use config for custom transitions
const dramatic = getFadeConfig('dramatic');
await transitionVolume(0, 0, dramatic.duration, dramatic.pauseCurve);
```

## cancelVolumeTransition

Cancels an active volume transition on a specific channel.

### Syntax

```typescript
cancelVolumeTransition(channelNumber: number): void
```

### Examples

```typescript
import { fadeVolume, cancelVolumeTransition } from 'audio-channel-queue';

// Start a long fade
fadeVolume(0, 0, 5000); // 5 second fade out

// Cancel it after 1 second
setTimeout(() => {
  cancelVolumeTransition(0);
  console.log('Fade cancelled');
}, 1000);
```

## cancelAllVolumeTransitions

Cancels all active volume transitions across all channels.

### Syntax

```typescript
cancelAllVolumeTransitions(): void
```

### Examples

```typescript
import { cancelAllVolumeTransitions, stopAllAudio } from 'audio-channel-queue';

// Emergency stop all transitions
cancelAllVolumeTransitions();

// Clean up before scene change
async function changeScene(): Promise<void> {
  cancelAllVolumeTransitions();
  await stopAllAudio();
  loadNewScene();
}
```

## Next Steps

For advanced volume control techniques, check out the [Volume Ducking](../advanced/volume-ducking.md) system.

Now that you understand the volume system, explore:

- **[Advanced Queue Manipulation](../advanced/advanced-queue-manipulation.md)** - Precise queue control and monitoring
- **[Audio Information](./audio-information.md)** - Get real-time audio data
- **[Queue Management](./queue-management.md)** - Control audio queues
- **[Event Listeners](./event-listeners.md)** - Setting up Event Listeners
- **[Examples](../getting-started/basic-usage)** - Real-world event handling patterns 