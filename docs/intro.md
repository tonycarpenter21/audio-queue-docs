---
sidebar_position: 1
title: Welcome to Audio Channel Queue
description: Multi-channel audio queue management for browsers with TypeScript support
---

# 🎵 Audio Channel Queue Documentation

Welcome to **Audio Channel Queue** - the most comprehensive solution for managing audio playback in browser applications!

## 🌟 What is Audio Channel Queue?

Audio Channel Queue is a powerful TypeScript library that enables you to manage multiple independent audio queues simultaneously. Perfect for games, interactive applications, and any project requiring sophisticated audio control.

### ✨ Key Features

- 🎛️ **Multi-channel Management** - Independent audio queues for concurrent playback
- ⏯️ **Pause/Resume Control** - Full playback control for individual channels or all channels  
- 🔊 **Volume Control & Ducking** - Dynamic volume management with automatic background reduction
- 🔄 **Loop Support** - Seamless audio looping for background music and ambient sounds
- 🚨 **Priority Queueing** - Add urgent audio to the front of any queue
- ✂️ **Advanced Queue Manipulation** - Remove, reorder, and swap queue items with precision
- 📊 **Real-time Progress Tracking** - Comprehensive playback monitoring and metadata
- 🎯 **Event-driven Architecture** - Extensive callback system for UI integration
- 📘 **Full TypeScript Support** - Complete type definitions and IntelliSense
- 🚫 **Zero Dependencies** - Lightweight and self-contained
- 📜 **MIT Licensed** - Free for commercial and personal use

## 🚀 Quick Start

Get up and running in 2 minutes:

```bash
npm install audio-channel-queue
```

```typescript
import { queueAudio, setChannelVolume } from 'audio-channel-queue';

// Play audio on channel 0
await queueAudio('./sounds/music.mp3', 0);

// Play sound effects on channel 1 
await queueAudio('./sounds/explosion.wav', 1);

// Set volumes independently
setChannelVolume(0, 0.3); // Background music at 30%
setChannelVolume(1, 0.8); // Sound effects at 80%
```

## 🗺️ Documentation Sections

### 🚀 **[Getting Started](./getting-started/installation)**
Installation, setup, and your first audio queue

### 💡 **[Core Concepts](./core-concepts/audio-channels)**  
Understanding channels, queues, and audio lifecycle

### 📚 **[API Reference](./api-reference/queue-management)**
Complete function reference with examples

### 🎯 **[Examples](./getting-started/basic-usage)**
Real-world use cases for games and interactive apps

### 🔥 **[Advanced Features](./advanced/volume-ducking)**
Volume ducking, priority queuing, and progress tracking

### 🔄 **[Migration & Help](./migration/troubleshooting)**
Upgrading guides and troubleshooting

## 🎮 Use Cases

**Gaming Audio Systems**
```typescript
// Background music (channel 0)
await queueAudio('./music/background.mp3', 0, { loop: true, volume: 0.4 });

// Sound effects (channel 1) 
await queueAudio('./sfx/explosion.wav', 1);

// Set up voice announcements (channel 2) to duck all other audio
setVolumeDucking({ 
  priorityChannel: 2, 
  priorityVolume: 1.0,
  duckingVolume: 0.1 
});

// When voice plays on channel 2, all other channels will reduce to 10% volume
await queueAudio('./voice/game-over.wav', 2);
```

**Interactive Applications**
```typescript
// UI feedback sounds
await queueAudio('./ui/button-click.wav', 1);

// Notification alerts (priority)
await queueAudioPriority('./alerts/incoming-message.wav', 2);

// Ambient background
await queueAudio('./ambient/office-noise.mp3', 0, { loop: true });
```

## 🌐 Browser Support

- ✅ **Chrome 51+** (June 2016)
- ✅ **Firefox 54+** (June 2017)  
- ✅ **Safari 10+** (September 2016)
- ✅ **Edge 15+** (April 2017)
- ✅ **Mobile browsers** with HTML5 audio support

## 🔗 Helpful Links

- 📦 **[NPM Package](https://www.npmjs.com/package/audio-channel-queue)** - Install from npm
- 🎮 **[Live Demo](https://tonycarpenter21.github.io/audio-queue-demo)** - See it in action
- 📖 **[GitHub Repository](https://github.com/tonycarpenter21/audio-channel-queue)** - Source code
- 🐛 **[Report Issues](https://github.com/tonycarpenter21/audio-channel-queue/issues)** - Bug reports and feature requests

## 🤝 Community & Support

Need help? Have questions? 

- 💬 **[GitHub Discussions](https://github.com/tonycarpenter21/audio-channel-queue/discussions)** - Ask questions and share ideas
- 🐛 **[GitHub Issues](https://github.com/tonycarpenter21/audio-channel-queue/issues)** - Report bugs or request features
- 📧 **Contact** - Reach out for enterprise support

---

Ready to build amazing audio experiences? Let's **[get started](./getting-started/installation)**! 🚀
