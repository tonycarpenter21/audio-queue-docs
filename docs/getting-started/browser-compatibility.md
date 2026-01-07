---
sidebar_position: 3
title: Browser Compatibility
description: Browser support and compatibility information for AudioQ
---

# Browser Compatibility

AudioQ is designed for **browser environments** and uses the Web Audio API (`HTMLAudioElement`). Here's everything you need to know about browser support.

## Supported Browsers

### Desktop Browsers

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
| **Safari Mobile** | iOS 10+ | ✅ Full Support | Enhanced v1.13.0+ with Web Audio API fixes |
| **Samsung Internet** | Android 7+ | ✅ Full Support | Based on Chromium |
| **Firefox Mobile** | Android 7+ | ✅ Full Support | Good performance |

## ⚠️ Not Supported

- ❌ **Internet Explorer** (lacks ES6 and modern audio APIs)
- ❌ **Node.js** (server-side environments - no DOM/HTMLAudioElement)
- ❌ **Web Workers** (no DOM access for audio elements)
- ❌ **Very old mobile browsers** (Android < 7, iOS < 10)

#### 🆕 iOS Web Audio API Improvements (v1.13.0+)

Version 1.13.0 includes enhanced iOS compatibility:

- **✅ Fixed Volume Control Issues** - Volume changes and transitions now work properly on all iOS browsers
- **✅ Improved Web Audio API Integration** - Better handling of iOS-specific audio constraints
- **✅ Fallback Mechanisms** - Automatic fallbacks for browsers with limited Web Audio API support
- **✅ Better Performance** - Optimized audio element management for iOS devices

### Audio Format Fallbacks

Provide multiple audio formats for maximum compatibility:

```typescript
import { queueAudio } from 'audioq';

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

## Testing Browser Support

### Manual Testing Script

```html
<!DOCTYPE html>
<html>
<head>
  <title>AudioQ Browser Test</title>
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
          name: 'AudioQ Import',
          test: async () => {
            try {
              const module = await import('audioq');
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

## Additional Resources

- **[Can I Use - HTMLAudioElement](https://caniuse.com/audio)** - Audio element support
- **[Can I Use - Promises](https://caniuse.com/promises)** - Promise support  
- **[MDN - HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)** - Audio API documentation
- **[Web Audio API Support](https://caniuse.com/audio-api)** - Advanced audio features

---

Need help with a specific browser issue? Check our **[troubleshooting guide](../migration/troubleshooting)** or **[open an issue](https://github.com/tonycarpenter21/audioq/issues)** with your browser details!