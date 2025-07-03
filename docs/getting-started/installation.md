---
sidebar_position: 1
title: Installation
description: How to install and set up audio-channel-queue in your project
---

# 📦 Installation

## Install with npm

```bash
npm install audio-channel-queue
```

## Install with yarn

```bash
yarn add audio-channel-queue
```

## Install with pnpm

```bash
pnpm add audio-channel-queue
```

## 📋 Requirements

### Environment Requirements
- **Browser environment** (not Node.js server-side)
- **HTML5 audio support** (available in all modern browsers)

### Development Requirements
- **Node.js 14+** (for building and testing only)
- **TypeScript 4.5+** (optional, but recommended)

## 🚀 Basic Setup

### ES6 Modules (Recommended)

```typescript
import { 
  queueAudio, 
  setChannelVolume, 
  pauseChannel,
  onAudioStart 
} from 'audio-channel-queue';

// Start using immediately!
await queueAudio('./sounds/welcome.mp3');
```

### CommonJS

```javascript
const { 
  queueAudio, 
  setChannelVolume, 
  pauseChannel 
} = require('audio-channel-queue');

// Start using immediately!
queueAudio('./sounds/welcome.mp3');
```

### UMD (Browser Script Tag)

```html
<script src="node_modules/audio-channel-queue/dist/index.umd.js"></script>
<script>
  // Available as global AudioChannelQueue
  AudioChannelQueue.queueAudio('./sounds/welcome.mp3');
</script>
```

## ⚙️ TypeScript Configuration

### Add Type Declarations for Audio Files

If you're importing audio files directly, create a `custom.d.ts` file in your project root:

```typescript title="custom.d.ts"
declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}

declare module '*.m4a' {
  const src: string;
  export default src;
}
```

### TypeScript Configuration

Update your `tsconfig.json` to include type declarations:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*",
    "custom.d.ts"
  ]
}
```

## 🎵 Audio File Preparation

### Supported Formats

Audio Channel Queue supports all formats that the browser's `HTMLAudioElement` supports:

- **MP3** - Universal support, good compression
- **WAV** - Uncompressed, high quality, larger files
- **OGG** - Open source format, good compression
- **M4A/AAC** - Good compression, widely supported
- **WEBM** - Modern format, excellent compression

### Format Recommendations

| Use Case | Recommended Format | Why |
|----------|-------------------|-----|
| **Music/Background** | MP3 or M4A | Good compression, universal support |
| **Short Sound Effects** | WAV | No compression artifacts, fast loading |
| **Voice/Speech** | MP3 | Good compression for speech |
| **Game Audio** | WAV or OGG | Low latency, good quality |

## 🔧 Build Tool Configuration

### Webpack

Audio files are typically handled by webpack's asset handling:

```javascript title="webpack.config.js"
module.exports = {
  module: {
    rules: [
      {
        test: /\.(mp3|wav|ogg|m4a)$/,
        type: 'asset/resource',
        generator: {
          filename: 'audio/[name][ext]'
        }
      }
    ]
  }
};
```

### Vite

Vite handles audio files out of the box:

```typescript title="vite.config.ts"
import { defineConfig } from 'vite';

export default defineConfig({
  assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg', '**/*.m4a']
});
```

### Create React App

CRA handles audio files by default when imported:

```typescript
import welcomeSound from './audio/welcome.mp3';
import { queueAudio } from 'audio-channel-queue';

// Use the imported path
await queueAudio(welcomeSound);
```

## ✅ Verify Installation

Create a simple test to verify everything is working:

```typescript title="test-audio.ts"
import { queueAudio, onAudioStart } from 'audio-channel-queue';

// Set up event listener
onAudioStart(0, (info) => {
  console.log('Audio started:', info.fileName);
  console.log('Duration:', info.duration, 'ms');
});

// Test with a simple audio file
export async function testAudio() {
  try {
    await queueAudio('./audio/test-sound.mp3');
    console.log('✅ Audio Channel Queue is working!');
  } catch (error) {
    console.error('❌ Error playing audio:', error);
  }
}

// Call the test
testAudio();
```

## 🐛 Troubleshooting Installation

### Common Issues

**"Module not found" error**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**TypeScript import errors**
- Ensure you have the `custom.d.ts` file for audio imports
- Check that TypeScript can find the module types

**Audio files not loading**
- Verify your build tool is configured to handle audio assets
- Check that file paths are correct relative to your build output

**Browser compatibility issues**
- Verify you're using a [supported browser](./browser-compatibility)
- Check the browser console for specific error messages

### Getting Help

If you're still having issues:

1. Check the [troubleshooting guide](../migration/troubleshooting)
2. Search [existing issues](https://github.com/tonycarpenter21/audio-channel-queue/issues)
3. Open a [new issue](https://github.com/tonycarpenter21/audio-channel-queue/issues/new) with:
   - Your environment details (OS, browser, Node.js version)
   - Build tool configuration
   - Error messages
   - Minimal reproduction example

## 🎯 Next Steps

Now that you have audio-channel-queue installed, let's create your first audio queue:

➡️ **[Quick Start Guide](./quick-start)** - Build your first audio application in 5 minutes 