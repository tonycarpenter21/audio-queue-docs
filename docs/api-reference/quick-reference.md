---
sidebar_position: 0
title: Quick Reference
description: Quick reference guide with concise examples for all audio-channel-queue functions
---

# Quick Reference

Quick examples for all `audio-channel-queue` functions. For detailed documentation, click the function names.

## 🎵 Basic Queue Operations

### [queueAudio()](./queue-management#queueaudio)
```typescript
// Basic usage - plays on channel 0
await queueAudio('./sounds/music.mp3');

// Specific channel with options
await queueAudio('./sounds/bgm.mp3', 0, { 
  loop: true,    // Repeat forever
  volume: 0.5    // 50% volume
});

// Queue multiple files - play in order
await queueAudio('./track1.mp3');
await queueAudio('./track2.mp3');  // Plays after track1
```

### [queueAudioPriority()](./queue-management#queueaudiopriority)
```typescript
// Add to front of queue - plays next
await queueAudioPriority('./urgent-alert.mp3');

// With channel and options
await queueAudioPriority('./announcement.mp3', 1, { volume: 1.0 });

// Common pattern: interrupt current audio
await queueAudioPriority('./boss-music.mp3');
await stopCurrentAudioInChannel();  // Skip current, play boss music immediately
```

### [stopCurrentAudioInChannel()](./queue-management#stopcurrentaudioinchannel)
```typescript
// Skip to next in queue - channel 0 (default)
await stopCurrentAudioInChannel();

// Skip on specific channel
await stopCurrentAudioInChannel(1);

// Best practice: check if audio exists first
if (getCurrentAudioInfo()) {
  await stopCurrentAudioInChannel();
}
```

### [stopAllAudioInChannel()](./queue-management#stopallaudioinchannel)
```typescript
// Clear entire queue and stop - channel 0 (default)
stopAllAudioInChannel();

// Clear specific channel
stopAllAudioInChannel(2);

// Common: reset before new playlist
stopAllAudioInChannel();
await queueAudio('./new-playlist/song1.mp3');
```

### [stopAllAudio()](./queue-management#stopallaudio)
```typescript
// Nuclear option - stop everything
await stopAllAudio();

// Common: panic button
document.getElementById('emergency-stop').onclick = () => {
  await stopAllAudio();
};
```

## 🔊 Volume Control

### [setChannelVolume()](./volume-control#setchannelvolume)
```typescript
// Set volume (0-1 range)
setChannelVolume(0, 0.5);  // Channel 0 at 50%
setChannelVolume(1, 0.8);  // Channel 1 at 80%

// Mute/unmute pattern
setChannelVolume(0, 0);    // Mute
setChannelVolume(0, 0.7);  // Restore

// With smooth transitions (new!)
await setChannelVolume(0, 0.3, 500, 'ease-out');  // Fade over 500ms
```

### [getChannelVolume()](./volume-control#getchannelvolume)
```typescript
// Get current volume - channel 0 (default)
const volume = getChannelVolume();

// Specific channel
const bgmVolume = getChannelVolume(0);
console.log(`BGM: ${(bgmVolume * 100).toFixed(0)}%`);
```

### [getAllChannelsVolume()](./volume-control#getallchannelsvolume)
```typescript
// Get all channel volumes as array
const volumes = getAllChannelsVolume();
volumes.forEach((vol, ch) => console.log(`Ch${ch}: ${vol * 100}%`));
```

### [setAllChannelsVolume()](./volume-control#setallchannelsvolume)
```typescript
// Master volume control
setAllChannelsVolume(0.5);  // All channels 50%
setAllChannelsVolume(0);    // Mute all

// Fade out pattern
for (let v = 1.0; v >= 0; v -= 0.1) {
  setAllChannelsVolume(v);
  await new Promise(r => setTimeout(r, 100));
}
```

### [setVolumeDucking()](./volume-control#setvolumeducking)
```typescript
// Simple ducking - reduce others when priority plays
setVolumeDucking({ 
  priorityChannel: 1,     // Announcements
  duckingVolume: 0.2      // Others at 20%
});

// Full config with smooth transition
setVolumeDucking({
  priorityChannel: 2,
  priorityVolume: 1.0,           // Priority at 100%
  duckingVolume: 0.1,            // Others at 10%
  duckTransitionDuration: 300,   // 300ms duck
  restoreTransitionDuration: 500 // 500ms restore
});

// Remove ducking
clearVolumeDucking();
```

### [fadeVolume()](./volume-control#fadevolume)
```typescript
// Smooth volume transitions
await fadeVolume(0, 0, 1000);         // Fade out over 1s
await fadeVolume(0, 1, 500, 'ease-out'); // Fade in over 500ms

// Cross-fade between channels
await Promise.all([
  fadeVolume(0, 0, 800, 'ease-in'),
  fadeVolume(1, 1, 800, 'ease-out')
]);
```

## ⏯️ Pause & Resume

### [pauseChannel()](./pause-resume#pausechannel)
```typescript
// Pause channel 0 (default)
await pauseChannel();

// Pause specific channel
await pauseChannel(1);

// Common: pause on focus loss
window.addEventListener('blur', () => pauseChannel());
```

### [resumeChannel()](./pause-resume#resumechannel)
```typescript
// Resume channel 0 (default)
await resumeChannel();

// Resume specific channel
await resumeChannel(1);

// Common: resume on focus
window.addEventListener('focus', () => resumeChannel());
```

### [togglePauseChannel()](./pause-resume#togglepausechannel)
```typescript
// Toggle pause state - channel 0 (default)
await togglePauseChannel();

// Space bar pause pattern
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    togglePauseChannel();
  }
});
```

### [pauseAllChannels()](./pause-resume#pauseallchannels) / [resumeAllChannels()](./pause-resume#resumeallchannels)
```typescript
// Pause everything
await pauseAllChannels();

// Resume everything
await resumeAllChannels();

// Common: mobile app background
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    await pauseAllChannels();
  } else {
    await resumeAllChannels();
  }
});
```

## 📊 Audio Information

### [getCurrentAudioInfo()](./audio-information#getcurrentaudioinfo)
```typescript
// Get current audio info - channel 0 (default)
const info = getCurrentAudioInfo();
if (info) {
  console.log(`Playing: ${info.fileName}`);
  console.log(`Progress: ${(info.progress * 100).toFixed(0)}%`);
}

// Progress bar update
function updateProgressBar() {
  const info = getCurrentAudioInfo();
  if (info) {
    progressBar.style.width = `${info.progress * 100}%`;
    timeLabel.textContent = `${formatTime(info.currentTime)} / ${formatTime(info.duration)}`;
  }
}
```

### [getQueueSnapshot()](./audio-information#getqueuesnapshot)
```typescript
// Get full queue state - channel 0 (default)
const snapshot = getQueueSnapshot();
console.log(`Queue: ${snapshot.totalItems} items`);

// Display playlist
const snapshot = getQueueSnapshot(0);
snapshot.items.forEach((item, index) => {
  const status = item.isCurrentlyPlaying ? '▶️' : '⏸️';
  console.log(`${status} ${index}: ${item.fileName}`);
});
```

### [getAllChannelsInfo()](./audio-information#getallchannelsinfo)
```typescript
// Monitor all channels
const allInfo = getAllChannelsInfo();
Object.entries(allInfo).forEach(([channel, info]) => {
  if (info) {
    console.log(`Ch${channel}: ${info.fileName} (${info.isPaused ? 'paused' : 'playing'})`);
  }
});
```

## 🔄 Advanced Queue Manipulation

### [removeQueuedItem()](../advanced/advanced-queue-manipulation#remove-queued-item)
```typescript
// Remove by position (can't remove currently playing at index 0)
const result = removeQueuedItem(2);  // Remove 3rd item
if (!result.success) console.error(result.error);

// Specific channel
removeQueuedItem(1, 1);  // Remove 2nd item from channel 1
```

### [reorderQueue()](../advanced/advanced-queue-manipulation#reorder-queue-items)
```typescript
// Move item from position 3 to position 1
const result = reorderQueue(3, 1);

// Move up/down patterns
function moveTrackUp(index: number) {
  if (index > 1) reorderQueue(index, index - 1);
}
```

### [swapQueueItems()](../advanced/advanced-queue-manipulation#swap-queue-items)
```typescript
// Swap positions (can't swap with playing item at 0)
swapQueueItems(1, 3);  // Swap 2nd and 4th items

// Shuffle pattern
function shuffleQueue() {
  const length = getQueueLength();
  for (let i = 1; i < length; i++) {
    const j = Math.floor(Math.random() * (length - 1)) + 1;
    swapQueueItems(i, j);
  }
}
```

### [clearQueueAfterCurrent()](../advanced/advanced-queue-manipulation#clear-queue-after-current)
```typescript
// Keep only current, clear rest
clearQueueAfterCurrent();

// Replace upcoming tracks
clearQueueAfterCurrent();
await queueAudio('./new-track1.mp3');
await queueAudio('./new-track2.mp3');
```

### [getQueueItemInfo()](../advanced/advanced-queue-manipulation#get-queue-item-info) / [getQueueLength()](../advanced/advanced-queue-manipulation#get-queue-length)
```typescript
// Get specific item info
const item = getQueueItemInfo(1);  // 2nd item
if (item) {
  console.log(`Next: ${item.fileName} (${item.duration}ms)`);
}

// Get queue size
const length = getQueueLength();  // Channel 0 (default)
console.log(`${length} tracks queued`);
```

## 🎧 Event Listeners

### [onAudioStart()](./event-listeners#onaudiostart) / [onAudioComplete()](./event-listeners#onaudiocomplete)
```typescript
// Track when audio starts
onAudioStart(0, (info) => {
  console.log(`Now playing: ${info.fileName}`);
  updateNowPlayingUI(info);
});

// Auto-play next playlist when done
onAudioComplete(0, async (info) => {
  const queueLength = getQueueLength();
  if (queueLength === 0) {
    await loadNextPlaylist();
  }
});

// Note: onAudioStart and onAudioComplete don't have off functions
// Listeners persist until channel is destroyed
```

### [onAudioProgress()](./event-listeners#onaudioprogress)
```typescript
// Real-time progress updates
onAudioProgress(0, (info) => {
  progressBar.value = info.progress * 100;
  timeDisplay.textContent = formatTime(info.currentTime);
});

// Clean up when done
offAudioProgress(0);
```

### [onQueueChange()](./event-listeners#onqueuechange)
```typescript
// Update UI when queue changes
onQueueChange(0, (snapshot) => {
  playlistElement.innerHTML = '';
  snapshot.items.forEach(item => {
    playlistElement.appendChild(createTrackElement(item));
  });
});

// Remove listener
offQueueChange(0);
```

## 💡 Common Patterns

### Multi-Channel Game Audio
```typescript
const Channels = { BGM: 0, SFX: 1, VOICE: 2 };

// Background music
await queueAudio('./music/level1.mp3', Channels.BGM, { loop: true, volume: 0.4 });

// Sound effects (multiple can overlap via queue)
await queueAudio('./sfx/jump.wav', Channels.SFX);
await queueAudio('./sfx/coin.wav', Channels.SFX);

// Important dialogue
await queueAudioPriority('./voice/boss-warning.mp3', Channels.VOICE);
```

### Playlist with Skip Controls
```typescript
// Load playlist
const tracks = ['song1.mp3', 'song2.mp3', 'song3.mp3'];
for (const track of tracks) {
  await queueAudio(`./music/${track}`);
}

// Skip button
skipButton.onclick = () => stopCurrentAudioInChannel();

// Previous button (simple approach)
prevButton.onclick = () => {
  stopAllAudioInChannel();
  // Re-queue from previous track
  for (let i = currentTrackIndex - 1; i < tracks.length; i++) {
    await queueAudio(`./music/${tracks[i]}`);
  }
};
```

### Background Audio with Interruptions
```typescript
// Ambient background
await queueAudio('./ambient/office.mp3', 0, { loop: true, volume: 0.2 });

// Notification system
async function playNotification(type: string) {
  // Duck background automatically
  setVolumeDucking({ priorityChannel: 1, duckingVolume: 0.1 });
  
  await queueAudioPriority(`./notifications/${type}.mp3`, 1);
  
  // Remove ducking after notification
  onAudioComplete(1, () => {
    clearVolumeDucking();
    // Note: onAudioComplete listeners can't be removed individually
  });
}
```

---

📚 For detailed documentation and advanced examples, visit the specific function pages linked above. 