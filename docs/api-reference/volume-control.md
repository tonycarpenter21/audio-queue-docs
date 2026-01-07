# Volume Control

Control audio levels across individual channels or all channels simultaneously. For automated volume control, check out the [Volume Ducking](./volume-ducking.md) documentation.

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

## setGlobalVolume

Sets a global volume multiplier that affects all channels while preserving their relative volume levels.

### Syntax

```typescript
setGlobalVolume(volume: number): Promise<void>
```

### Parameters

- `volume` (number): Global volume multiplier between 0.0 (muted) and 1.0 (full volume)

### How Global Volume Works

The global volume acts as a **multiplier** - it scales all channel volumes proportionally while preserving their individual settings. This is perfect for implementing an app volume slider in your UI.

### Examples

```typescript
import { setGlobalVolume, setChannelVolume } from 'audio-channel-queue';

// Set up different audio types with individual volumes
await setChannelVolume(0, 0.3); // SFX channel at 30%
await setChannelVolume(1, 0.7); // Music channel at 70%
await setChannelVolume(2, 0.5); // Voice channel at 50%

// User adjusts global volume slider to 50%
await setGlobalVolume(0.5);

// Actual playback volumes become:
// - SFX: 30% × 50% = 15%
// - Music: 70% × 50% = 35%
// - Voice: 50% × 50% = 25%

// Channel volumes remain at their original settings (0.3, 0.7, 0.5)
// So when global volume is increased, ratios are preserved
await setGlobalVolume(1.0); // Back to full volume
// - SFX: 30% × 100% = 30%
// - Music: 70% × 100% = 70%
// - Voice: 50% × 100% = 50%

// Quick mute all audio without losing individual settings
await setGlobalVolume(0); // Mute everything
await setGlobalVolume(1.0); // Restore with all ratios intact
```

### Difference from setAllChannelsVolume

```typescript
// setAllChannelsVolume() sets all channels to the SAME volume
await setChannelVolume(0, 0.3);
await setChannelVolume(1, 0.7);
await setAllChannelsVolume(0.5); // Both channels now at 0.5

// setGlobalVolume() MULTIPLIES all channels by the same amount
await setChannelVolume(0, 0.3);
await setChannelVolume(1, 0.7);
await setGlobalVolume(0.5); // Channel 0 at 0.15, Channel 1 at 0.35
```

## getGlobalVolume

Gets the current global volume multiplier.

### Syntax

```typescript
getGlobalVolume(): number
```

### Returns

- `number`: Current global volume multiplier (0.0 to 1.0)

### Examples

```typescript
import { getGlobalVolume, setGlobalVolume } from 'audio-channel-queue';

// Get current global volume
const globalVol = getGlobalVolume(); // Returns current global volume (0-1)
console.log(`Global volume: ${(globalVol * 100).toFixed(0)}%`);

// Check if globally muted
if (getGlobalVolume() === 0) {
  console.log('All audio is globally muted');
}

// Save and restore global volume
const savedVolume = getGlobalVolume();
await setGlobalVolume(0); // Temporarily mute
// ... do something ...
await setGlobalVolume(savedVolume); // Restore

// Display in UI
function updateVolumeDisplay(): void {
  const volume = getGlobalVolume();
  const percentage = Math.round(volume * 100);
  document.getElementById('volume-display')!.textContent = `${percentage}%`;
  document.getElementById('volume-slider')!.value = volume.toString();
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
import { transitionVolume, cancelVolumeTransition } from 'audio-channel-queue';

// Start a long fade
transitionVolume(0, 0, 5000); // 5 second fade out

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

For advanced volume control techniques, check out the [Volume Ducking](./volume-ducking.md) system.

Now that you understand the volume system, explore:

- **[Advanced Queue Manipulation](./advanced-queue-manipulation.md)** - Precise queue control and monitoring
- **[Audio Information](./audio-information.md)** - Get real-time audio data
- **[Queue Management](./queue-management.md)** - Control audio queues
- **[Event Listeners](./event-listeners.md)** - Setting up Event Listeners
- **[Examples](../getting-started/basic-usage)** - Real-world event handling patterns 