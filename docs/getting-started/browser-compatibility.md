---
sidebar_position: 3
title: Browser Compatibility
description: Browser support and compatibility information for audio-channel-queue
---

# 🌐 Browser Compatibility

Audio Channel Queue is designed for **browser environments** and uses the Web Audio API (`HTMLAudioElement`). Here's everything you need to know about browser support.

## ✅ Supported Browsers

### 🖥️ Desktop Browsers

| Browser | Minimum Version | Release Date | Support Level |
|---------|----------------|--------------|---------------|
| **Chrome** | 51+ | June 2016 | ✅ Full Support |
| **Firefox** | 54+ | June 2017 | ✅ Full Support |
| **Safari** | 10+ | September 2016 | ✅ Full Support |
| **Edge** | 15+ | April 2017 | ✅ Full Support |
| **Opera** | 38+ | June 2016 | ✅ Full Support |

### 📱 Mobile Browsers

| Browser | Platform | Support Level | Notes |
|---------|----------|---------------|-------|
| **Chrome Mobile** | Android 7+ | ✅ Full Support | Excellent performance |
| **Safari Mobile** | iOS 10+ | ✅ Full Support | Some audio policy restrictions |
| **Samsung Internet** | Android 7+ | ✅ Full Support | Based on Chromium |
| **Firefox Mobile** | Android 7+ | ✅ Full Support | Good performance |
| **Edge Mobile** | iOS/Android | ✅ Full Support | Based on Chromium |

## ⚠️ Not Supported

- ❌ **Internet Explorer** (lacks ES6 and modern audio APIs)
- ❌ **Node.js** (server-side environments - no DOM/HTMLAudioElement)
- ❌ **Web Workers** (no DOM access for audio elements)
- ❌ **Very old mobile browsers** (Android < 7, iOS < 10)

## 🔍 Feature Detection

Before using Audio Channel Queue, you can check if the browser supports the required features:

```typescript
function isBrowserSupported(): boolean {
  // Check for HTMLAudioElement support
  if (typeof Audio === 'undefined') {
    console.error('HTMLAudioElement not supported');
    return false;
  }

  // Check for Promise support
  if (typeof Promise === 'undefined') {
    console.error('Promises not supported');
    return false;
  }

  // Check for ES6 features
  try {
    new Function('const test = () => {};');
  } catch (e) {
    console.error('ES6 arrow functions not supported');
    return false;
  }

  return true;
}

// Use the detection
if (isBrowserSupported()) {
  import('audio-channel-queue').then(({ queueAudio }) => {
    // Safe to use the library
    queueAudio('./sounds/welcome.mp3');
  });
} else {
  // Show fallback or error message
  console.warn('Browser not supported for Audio Channel Queue');
}
```

## 📱 Mobile-Specific Considerations

### iOS Audio Policies

iOS has strict audio policies that affect all web audio:

```typescript
// iOS requires user interaction before playing audio
document.addEventListener('click', async () => {
  // This will work on iOS after user interaction
  await queueAudio('./sounds/welcome.mp3');
}, { once: true });

// Alternative: Create a "Start Audio" button
function createAudioStartButton() {
  const button = document.createElement('button');
  button.textContent = '🎵 Enable Audio';
  button.onclick = async () => {
    await queueAudio('./sounds/welcome.mp3');
    button.style.display = 'none';
  };
  document.body.appendChild(button);
}
```

### Android Audio Considerations

Most modern Android browsers work well, but some older versions may have limitations:

```typescript
// Check for autoplay support
function canAutoplay(): Promise<boolean> {
  const audio = new Audio();
  const promise = audio.play();
  
  if (promise !== undefined) {
    return promise.then(() => {
      audio.pause();
      return true;
    }).catch(() => false);
  }
  
  return Promise.resolve(false);
}

// Use autoplay detection
canAutoplay().then(canPlay => {
  if (canPlay) {
    // Can start audio immediately
    queueAudio('./sounds/welcome.mp3');
  } else {
    // Need user interaction first
    createAudioStartButton();
  }
});
```

## 🔧 Polyfills and Fallbacks

### Promise Polyfill (for very old browsers)

If you need to support older browsers without Promise support:

```html
<!-- Add this before your main script -->
<script src="https://cdn.jsdelivr.net/npm/es6-promise@4.2.8/dist/es6-promise.auto.min.js"></script>
```

### Audio Format Fallbacks

Provide multiple audio formats for maximum compatibility:

```typescript
import { queueAudio } from 'audio-channel-queue';

async function playWithFallback(baseName: string) {
  const formats = ['.mp3', '.ogg', '.wav'];
  
  for (const format of formats) {
    try {
      await queueAudio(`${baseName}${format}`);
      return; // Success - stop trying other formats
    } catch (error) {
      console.warn(`Failed to load ${baseName}${format}`);
    }
  }
  
  console.error(`Could not load ${baseName} in any format`);
}

// Usage
await playWithFallback('./sounds/welcome');
```

## 🧪 Testing Browser Support

### Manual Testing Script

```html
<!DOCTYPE html>
<html>
<head>
  <title>Audio Channel Queue Browser Test</title>
</head>
<body>
  <h1>Browser Compatibility Test</h1>
  <div id="results"></div>
  
  <script type="module">
    const results = document.getElementById('results');
    
    async function runTests() {
      const tests = [
        {
          name: 'HTMLAudioElement',
          test: () => typeof Audio !== 'undefined'
        },
        {
          name: 'Promises',
          test: () => typeof Promise !== 'undefined'
        },
        {
          name: 'ES6 Arrow Functions',
          test: () => {
            try {
              new Function('const test = () => {};');
              return true;
            } catch (e) {
              return false;
            }
          }
        },
        {
          name: 'Audio Channel Queue Import',
          test: async () => {
            try {
              const module = await import('audio-channel-queue');
              return typeof module.queueAudio === 'function';
            } catch (e) {
              return false;
            }
          }
        }
      ];
      
      for (const test of tests) {
        try {
          const result = await test.test();
          results.innerHTML += `<p>✅ ${test.name}: ${result ? 'PASS' : 'FAIL'}</p>`;
        } catch (error) {
          results.innerHTML += `<p>❌ ${test.name}: ERROR - ${error.message}</p>`;
        }
      }
    }
    
    runTests();
  </script>
</body>
</html>
```

### Automated Testing with Playwright

```typescript
// test-browser-support.spec.ts
import { test, expect } from '@playwright/test';

const browsers = [
  'chromium',
  'firefox', 
  'webkit'
];

for (const browserName of browsers) {
  test(`Audio Channel Queue works in ${browserName}`, async ({ page }) => {
    // Navigate to your test page
    await page.goto('/audio-test.html');
    
    // Test basic functionality
    const result = await page.evaluate(async () => {
      const { queueAudio } = await import('audio-channel-queue');
      
      try {
        // This should not throw if the browser is supported
        await queueAudio('data:audio/wav;base64,UklGRigAAABXQVZFZm10...');
        return 'success';
      } catch (error) {
        return error.message;
      }
    });
    
    expect(result).toBe('success');
  });
}
```

## 🎯 Best Practices for Cross-Browser Support

### 1. **Progressive Enhancement**

```typescript
// Start with basic functionality, enhance as features are available
if (isBrowserSupported()) {
  // Full audio functionality
  const audioManager = new AudioManager();
  audioManager.start();
} else {
  // Fallback: show static content or alternative experience
  showFallbackContent();
}
```

### 2. **Graceful Degradation**

```typescript
// Try advanced features, fall back gracefully
try {
  // Try with advanced options
  await queueAudio('./music.mp3', 0, { 
    loop: true, 
    volume: 0.5 
  });
} catch (error) {
  // Fall back to basic playback
  await queueAudio('./music.mp3');
}
```

### 3. **Feature Detection Over Browser Detection**

```typescript
// Good: Test for specific features
const hasAudioContext = 'AudioContext' in window || 'webkitAudioContext' in window;

// Avoid: Browser sniffing
// const isChrome = /Chrome/.test(navigator.userAgent); // Don't do this
```

## 📊 Browser Usage Statistics

Based on current web usage (2024):

- **Chrome-based browsers**: ~65% (Chrome, Edge, Opera, Samsung Internet)
- **Safari/WebKit**: ~20% (Safari Desktop/Mobile)
- **Firefox**: ~8%
- **Other**: ~7%

This means Audio Channel Queue will work for **93%+ of all web users** with modern browsers.

## 🔗 Additional Resources

- **[Can I Use - HTMLAudioElement](https://caniuse.com/audio)** - Audio element support
- **[Can I Use - Promises](https://caniuse.com/promises)** - Promise support  
- **[MDN - HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)** - Audio API documentation
- **[Web Audio API Support](https://caniuse.com/audio-api)** - Advanced audio features

---

Need help with a specific browser issue? Check our **[troubleshooting guide](../migration/troubleshooting)** or **[open an issue](https://github.com/tonycarpenter21/audio-channel-queue/issues)** with your browser details! 🚀 