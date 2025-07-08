# Advanced Queue Manipulation

Advanced queue manipulation functions for precise control over audio playback order and queue management. All functions support channel 0 fallback for convenience.

## Overview

The advanced queue manipulation API provides granular control over audio queues beyond basic queueing and playback. These functions allow you to:

- Remove specific items from queues
- Reorder queue items
- Swap positions of queue items
- Clear queues while preserving currently playing audio
- Get detailed information about queue items
- Query queue lengths

**Important Note**: All queue indices are 0-based. The currently playing audio is always at index 0 and cannot be manipulated with these functions. Queue manipulation operations can only be performed on indices 1 and higher (the queued items that are not currently playing).

## QueueManipulationResult Interface

All queue manipulation functions return a standardized result object:

```typescript
interface QueueManipulationResult {
  success: boolean;             // Whether the operation was successful
  error?: string;               // Error message if operation failed
  updatedQueue?: QueueSnapshot; // The queue snapshot after the operation (if successful)
}
```

## Remove Queued Item

Remove a specific item from the queue by its position. Since index 0 contains the currently playing audio, you can only remove items at indices 1 and higher.

### Syntax

```typescript
removeQueuedItem(queuedSlotNumber: number, channelNumber: number = 0): QueueManipulationResult
```

### Parameters

- `queuedSlotNumber` (number): The position of the item to remove (0-based index, must be ≥ 1 since index 0 is currently playing)
- `channelNumber` (number, optional): The channel number (defaults to 0)

### Examples

```typescript
import { removeQueuedItem, queueAudio } from 'audio-channel-queue';

// Setup a queue first
await queueAudio('/audio/track1.mp3'); // Index 0 (playing)
await queueAudio('/audio/track2.mp3'); // Index 1
await queueAudio('/audio/track3.mp3'); // Index 2
await queueAudio('/audio/track4.mp3'); // Index 3

// Remove item at index 2 from default channel (0)
const result = removeQueuedItem(2); // Uses channel 0 fallback

if (result.success) {
  console.log('Successfully removed item from queue');
  console.log(`Queue now has ${result.updatedQueue.totalItems} items`);
} else {
  console.error('Failed to remove item:', result.error);
}

// Remove item from a specific channel
const channel1Result = removeQueuedItem(1, 1); // Remove index 1 from channel 1
```

## Reorder Queue Items

Move a queue item from one position to another. Since index 0 contains the currently playing audio, you can only reorder items at indices 1 and higher.

### Syntax

```typescript
reorderQueue(currentQueuedSlotNumber: number, newQueuedSlotNumber: number, channelNumber: number = 0): QueueManipulationResult
```

### Parameters

- `currentQueuedSlotNumber` (number): Current position of the item (0-based index, must be ≥ 1 since index 0 is currently playing)
- `newQueuedSlotNumber` (number): New position for the item (0-based index, must be ≥ 1 since index 0 is reserved for currently playing)
- `channelNumber` (number, optional): The channel number (defaults to 0)

### Examples

```typescript
import { reorderQueue, queueAudio, getQueueSnapshot } from 'audio-channel-queue';

// Setup a queue
await queueAudio('/audio/intro.mp3');    // Index 0 (playing)
await queueAudio('/audio/song1.mp3');    // Index 1
await queueAudio('/audio/song2.mp3');    // Index 2
await queueAudio('/audio/song3.mp3');    // Index 3
await queueAudio('/audio/outro.mp3');    // Index 4

// Move item from index 3 to index 1 in default channel (0)
const result = reorderQueue(3, 1); // Uses channel 0 fallback

if (result.success) {
  console.log('Successfully reordered queue');
  console.log('New queue order:');
  result.updatedQueue.items.forEach((item, index) => {
    const status = item.isCurrentlyPlaying ? '🔊 Playing' : `${index}. Queued`;
    console.log(`${status}: ${item.fileName}`);
  });
} else {
  console.error('Failed to reorder:', result.error);
}

// Reorder in a specific channel
const channel2Result = reorderQueue(2, 4, 2); // Move index 2 to 4 in channel 2
```

## Clear Queue After Current

Remove all items from the queue except the currently playing audio.

### Syntax

```typescript
clearQueueAfterCurrent(channelNumber: number = 0): QueueManipulationResult
```

### Parameters

- `channelNumber` (number, optional): The channel number (defaults to 0)

### Examples

```typescript
import { clearQueueAfterCurrent, queueAudio } from 'audio-channel-queue';

// Setup a queue with multiple items
await queueAudio('/audio/current.mp3');   // Index 0 (playing)
await queueAudio('/audio/next1.mp3');     // Index 1
await queueAudio('/audio/next2.mp3');     // Index 2
await queueAudio('/audio/next3.mp3');     // Index 3

// Clear all queued items after the current one in default channel (0)
const result = clearQueueAfterCurrent(); // Uses channel 0 fallback

if (result.success) {
  console.log('Successfully cleared queue after current');
  console.log(`Queue now has ${result.updatedQueue.totalItems} item(s)`);
  // Should show 1 item (the currently playing audio)
} else {
  console.error('Failed to clear queue:', result.error);
}

// Clear queue in a specific channel
const channel3Result = clearQueueAfterCurrent(3);
```

## Swap Queue Items

Swap the positions of two items in the queue. Since index 0 contains the currently playing audio, you can only swap items at indices 1 and higher.

### Syntax

```typescript
swapQueueItems(slotA: number, slotB: number, channelNumber: number = 0): QueueManipulationResult
```

### Parameters

- `slotA` (number): Position of the first item (0-based index, must be ≥ 1 since index 0 is currently playing)
- `slotB` (number): Position of the second item (0-based index, must be ≥ 1 since index 0 is currently playing)
- `channelNumber` (number, optional): The channel number (defaults to 0)

### Examples

```typescript
import { swapQueueItems, queueAudio } from 'audio-channel-queue';

// Setup a queue
await queueAudio('/audio/playing.mp3');  // Index 0 (playing)
await queueAudio('/audio/first.mp3');    // Index 1
await queueAudio('/audio/second.mp3');   // Index 2
await queueAudio('/audio/third.mp3');    // Index 3

// Swap items at index 1 and 3 in default channel (0)
const result = swapQueueItems(1, 3); // Uses channel 0 fallback

if (result.success) {
  console.log('Successfully swapped queue items');
  console.log('Updated queue order:');
  result.updatedQueue.items.forEach((item, index) => {
    const status = item.isCurrentlyPlaying ? '🔊 Playing' : `${index}. Queued`;
    console.log(`${status}: ${item.fileName}`);
  });
} else {
  console.error('Failed to swap items:', result.error);
}

// Swap items in a specific channel
const channel1Result = swapQueueItems(2, 4, 1); // Swap index 2 and 4 in channel 1
```

## Get Queue Item Info

Get detailed information about a specific item in the queue.

### Syntax

```typescript
getQueueItemInfo(queueSlotNumber: number, channelNumber: number = 0): QueueItem | null
```

### Parameters

- `queueSlotNumber` (number): The position of the item to query (0-based index)
- `channelNumber` (number, optional): The channel number (defaults to 0)

### Returns

- `QueueItem | null`: Information about the queue item, or `null` if not found

### QueueItem Properties

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

### Examples

```typescript
import { getQueueItemInfo, queueAudio } from 'audio-channel-queue';

// Setup a queue
await queueAudio('/audio/track1.mp3'); // Index 0
await queueAudio('/audio/track2.mp3'); // Index 1
await queueAudio('/audio/track3.mp3'); // Index 2

// Get info for item at index 1 in default channel (0)
const itemInfo = getQueueItemInfo(1); // Uses channel 0 fallback

if (itemInfo) {
  console.log('Queue item information:');
  console.log(`- File: ${itemInfo.fileName}`);
  console.log(`- Duration: ${Math.round(itemInfo.duration / 1000)} seconds`);
  console.log(`- Volume: ${itemInfo.volume}`);
  console.log(`- Currently playing: ${itemInfo.isCurrentlyPlaying}`);
  console.log(`- Looping: ${itemInfo.isLooping}`);
  console.log(`- Source: ${itemInfo.src}`);
} else {
  console.log('No item found at that position');
}

// Get info from a specific channel
const channel2Info = getQueueItemInfo(2, 2); // Get index 2 from channel 2
```

## Get Queue Length

Get the total number of items in a channel's queue.

### Syntax

```typescript
getQueueLength(channelNumber: number = 0): number
```

### Parameters

- `channelNumber` (number, optional): The channel number (defaults to 0)

### Returns

- `number`: The total number of items in the queue

### Examples

```typescript
import { getQueueLength, queueAudio } from 'audio-channel-queue';

// Setup a queue
await queueAudio('/audio/track1.mp3');
await queueAudio('/audio/track2.mp3');
await queueAudio('/audio/track3.mp3');

// Get queue length for default channel (0)
const length = getQueueLength(); // Uses channel 0 fallback
console.log(`Queue has ${length} items`);

// Get queue length for specific channels
const channel1Length = getQueueLength(1);
const channel2Length = getQueueLength(2);
console.log(`Channel 1: ${channel1Length} items`);
console.log(`Channel 2: ${channel2Length} items`);
```

## Best Practices

### Error Handling

Always check the `success` property of returned results:

```typescript
const result = removeQueuedItem(2);
if (result.success) {
  // Operation succeeded, use result.updatedQueue
  console.log('Operation successful');
} else {
  // Operation failed, check result.error
  console.error('Operation failed:', result.error);
}
```

### Channel Management

Use the channel 0 fallback for default operations, explicit channels for multi-channel scenarios:

```typescript
// For default channel operations
const defaultResult = removeQueuedItem(1);        // Uses channel 0 fallback
const defaultLength = getQueueLength();           // Uses channel 0 fallback

// For multi-channel scenarios
const channels = [1, 2, 3];
channels.forEach(channel => {
  const length = getQueueLength();                // Uses channel 0 fallback
  console.log(`Channel ${channel}: ${length} items`);
});
```

### Index Validation

Remember that queue manipulation cannot affect the currently playing item at index 0. You can only manipulate queued items at indices 1 and higher:

```typescript
// ❌ Invalid - cannot manipulate currently playing item at index 0
removeQueuedItem(0);        // Will fail - can't remove currently playing
reorderQueue(0, 2);         // Will fail - can't move currently playing
swapQueueItems(0, 1);       // Will fail - can't swap with currently playing

// ✅ Valid - manipulating queued items only (indices 1+)
removeQueuedItem(1);        // OK - removes second item in queue
reorderQueue(1, 3);         // OK - moves second item to fourth position
swapQueueItems(1, 2);       // OK - swaps second and third items
```

## Related Functions

- **[Queue Management](../api-reference/queue-management.md)** - Basic queue operations
- **[Audio Information](../api-reference/audio-information.md)** - Getting queue snapshots and audio info
- **[Event Listeners](../api-reference/event-listeners.md)** - Monitoring queue changes 