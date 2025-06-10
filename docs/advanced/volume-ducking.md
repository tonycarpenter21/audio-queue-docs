---
title: Volume Ducking
description: Advanced volume control and ducking techniques for audio-channel-queue
sidebar_position: 1
---

# Volume Ducking

Advanced volume control techniques for managing multiple audio channels.

## Coming Soon

This section is under development. For now, check out our [live demo](https://tonycarpenter21.github.io/audio-queue-demo/) for volume control examples.

## Quick Example

```typescript
import { setChannelVolume, getChannelVolume } from 'audio-channel-queue';

// Basic volume control
setChannelVolume(0, 0.5);  // 50% volume
setChannelVolume(1, 0.8);  // 80% volume

// Get current volume
const currentVolume = getChannelVolume(0);
```

## References

- **[API Reference](../api-reference/volume-control)** - Volume control functions
- **[Live Demo](https://tonycarpenter21.github.io/audio-queue-demo/)** - Interactive examples 