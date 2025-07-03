---
sidebar_position: 7
title: Utility Functions
description: Helper functions for URL validation, sanitization, and audio information extraction
---

# Utility Functions

Helper functions for common audio-related tasks like URL validation, filename extraction, and sanitization.

## validateAudioUrl

Validates an audio URL for security and correctness.

### Syntax

```typescript
validateAudioUrl(url: string): string
```

### Parameters

- `url` (string): The URL to validate

### Returns

- `string`: The validated URL

### Throws

- `Error`: If the URL is invalid or potentially malicious

### Examples

```typescript
import { validateAudioUrl } from 'audio-channel-queue';

// Valid URLs
validateAudioUrl('https://example.com/audio.mp3'); // OK
validateAudioUrl('./sounds/local.wav'); // OK

// Invalid URLs - will throw
validateAudioUrl('javascript:alert("XSS")'); // Throws: dangerous protocol
validateAudioUrl('../../../etc/passwd'); // Throws: path traversal
```

## sanitizeForDisplay

Sanitizes text for safe display in HTML contexts by escaping special characters.

### Syntax

```typescript
sanitizeForDisplay(text: string): string
```

### Parameters

- `text` (string): The text to sanitize

### Returns

- `string`: Sanitized text safe for HTML display

### Examples

```typescript
import { sanitizeForDisplay } from 'audio-channel-queue';

// Escapes HTML characters
sanitizeForDisplay('<script>alert("XSS")</script>'); 
// Returns: '&lt;script&gt;alert("XSS")&lt;/script&gt;'

// Normal text unchanged
sanitizeForDisplay('normal-file.mp3'); // Returns: 'normal-file.mp3'
```

## extractFileName

Extracts the filename from a URL string.

### Syntax

```typescript
extractFileName(url: string): string
```

### Parameters

- `url` (string): The URL to extract filename from

### Returns

- `string`: The extracted filename or 'unknown' if extraction fails

### Examples

```typescript
import { extractFileName } from 'audio-channel-queue';

extractFileName('https://example.com/audio/song.mp3'); // Returns: 'song.mp3'
extractFileName('/path/to/audio.wav'); // Returns: 'audio.wav'
extractFileName('track.mp3?version=2'); // Returns: 'track.mp3'
```

## cleanWebpackFilename

Removes webpack hash patterns from filenames.

### Syntax

```typescript
cleanWebpackFilename(fileName: string): string
```

### Parameters

- `fileName` (string): Filename that may contain webpack hashes

### Returns

- `string`: Cleaned filename with hashes removed

### Examples

```typescript
import { cleanWebpackFilename } from 'audio-channel-queue';

cleanWebpackFilename('song.a1b2c3d4.mp3'); // Returns: 'song.mp3'
cleanWebpackFilename('notification.1a2b3c4d5e6f.wav'); // Returns: 'notification.wav'
cleanWebpackFilename('clean-file.mp3'); // Returns: 'clean-file.mp3' (unchanged)
```

## getAudioInfoFromElement

Extracts comprehensive audio information from an HTMLAudioElement.

### Syntax

```typescript
getAudioInfoFromElement(
  audio: HTMLAudioElement,
  channelNumber?: number,
  audioChannels?: ExtendedAudioQueueChannel[]
): AudioInfo | null
```

### Parameters

- `audio` (HTMLAudioElement): The audio element to extract info from
- `channelNumber` (number, optional): Channel number for queue context
- `audioChannels` (ExtendedAudioQueueChannel[], optional): Channels array for remainingInQueue calculation

### Returns

- `AudioInfo | null`: Audio information or null if invalid

### Examples

```typescript
import { getAudioInfoFromElement } from 'audio-channel-queue';

const audioElement = new Audio('song.mp3');
const info = getAudioInfoFromElement(audioElement);

if (info) {
  console.log(`Progress: ${info.progress * 100}%`);
  console.log(`Duration: ${info.duration}ms`);
}
```

## createQueueSnapshot

Creates a complete snapshot of a queue's current state.

### Syntax

```typescript
createQueueSnapshot(
  channelNumber: number,
  audioChannels: ExtendedAudioQueueChannel[]
): QueueSnapshot | null
```

### Parameters

- `channelNumber` (number): The channel to snapshot
- `audioChannels` (ExtendedAudioQueueChannel[]): Array of audio channels

### Returns

- `QueueSnapshot | null`: Queue snapshot or null if channel doesn't exist

### Examples

```typescript
import { createQueueSnapshot, audioChannels } from 'audio-channel-queue';

const snapshot = createQueueSnapshot(0, audioChannels);
if (snapshot) {
  console.log(`Queue has ${snapshot.totalItems} items`);
  console.log(`Currently playing: ${snapshot.items[0]?.fileName}`);
}
```

## Best Practices

1. **Always validate user-provided URLs** with `validateAudioUrl()` before queuing
2. **Sanitize filenames** before displaying in UI with `sanitizeForDisplay()`
3. **Use `cleanWebpackFilename()`** for cleaner UI display of bundled assets
4. **Prefer higher-level APIs** like `getCurrentAudioInfo()` over `getAudioInfoFromElement()`

## Next Steps

- See [Audio Information](./audio-information.md) for higher-level info APIs
- Explore [Error Handling](./error-handling.md) for handling validation errors
- Learn about [Queue Management](./queue-management.md) for using validated URLs 