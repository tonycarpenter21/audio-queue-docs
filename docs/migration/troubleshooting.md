---
title: Troubleshooting
description: Common issues and solutions for audio-channel-queue
sidebar_position: 1
---

# Troubleshooting

Common issues and solutions when using audio-channel-queue.

## Audio Not Playing

### Browser Autoplay Policies
Modern browsers require user interaction before playing audio:

```typescript
// Wait for user interaction
document.addEventListener('click', () => {
  queueAudio('sounds/music.mp3');
}, { once: true });
```

### File Path Issues
Ensure audio files are accessible:

```typescript
// ✅ Correct - relative to public directory
queueAudio('sounds/music.mp3');

// ❌ Incorrect - absolute paths usually don't work
queueAudio('/Users/myuser/sounds/music.mp3');
```

## Performance Issues

### Too Many Channels
Limit the number of active channels:

```typescript
// ✅ Good - reasonable number of channels
for (let i = 0; i < 4; i++) {
  queueAudio('sound.mp3', i);
}

// ❌ Avoid - too many channels can impact performance
for (let i = 0; i < 100; i++) {
  queueAudio('sound.mp3', i);
}
```

## Browser Compatibility

### Safari Issues
Safari has stricter audio policies. Ensure user interaction before audio playback.

### Mobile Browsers
Some mobile browsers have additional restrictions on background audio.

## Need More Help?

- **[GitHub Issues](https://github.com/tonycarpenter21/audio-channel-queue/issues)** - Report bugs
- **[Live Demo](https://tonycarpenter21.github.io/audio-queue-demo/)** - Test functionality
- **[Browser Compatibility](../getting-started/browser-compatibility)** - Supported browsers 