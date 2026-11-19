---
sidebar_position: 3
title: Recipes
description: Copy-paste patterns for notifications, voice assistants, games, podcasts and more
---

# Recipes

## Notification sounds

Chat messages and alerts often arrive in bursts. `dedupeMs` plays each sound at most once per
window; urgent alerts can jump the queue or cut off whatever is playing.

```ts
await queueAudio('/sfx/message.mp3', 3, { dedupeMs: 1000 }); // repeats within 1s are ignored
await queueAudioPriority('/sfx/mention.mp3', 3); // plays next
await queueAudio('/sfx/incoming-call.mp3', 3, { interrupt: true, loop: true }); // plays now
```

## Voice assistants and text-to-speech

Queue each generated clip as it arrives; a `Blob` works directly and its object URL is cleaned up
for you. When the user starts talking, `interrupt` cuts the speech off.

```ts
const speak = async (text: string): Promise<void> => {
  const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
  await queueAudio(await response.blob(), 1, { metadata: { text } });
};
await speak('Hello!');
await speak('How can I help?');

await queueAudio('/sfx/listening.mp3', 1, { interrupt: true }); // barge-in
onAudioStart(1, (info) => console.log('saying:', info.metadata?.['text']));
```

Add [cues](../api-reference/sprites-and-cues#cues) to highlight words or move an avatar's mouth.

## Games

Use one channel per kind of sound, duck the music under voice lines, and pack short effects into
a [sprite](../api-reference/sprites-and-cues#audio-sprites).

```ts
const MUSIC = 0;
const SFX = 1;
const VOICE = 2;

setVolumeDucking({ duckingVolume: 0.3, priorityChannel: VOICE, priorityVolume: 1 });
await queueAudio('/music/level-1.mp3', MUSIC, { loop: true, volume: 0.5 });

const sfx = defineSprite('/sfx/sprite.mp3', { coin: [0, 300], jump: [400, 900] });
await sfx.play('coin', SFX, { interrupt: true });
await queueAudio('/voice/one-minute-left.mp3', VOICE);
```

Sounds on one channel play in order. For effects that should overlap, spread them over a few
channels.

## Podcasts and audiobooks

Resume where the listener stopped, at their preferred speed, with lock-screen controls.

```ts
const disconnect = connectMediaSession({ channel: 0, seekOffsetMs: 15000 });
await queueAudio('/episodes/42.mp3', 0, {
  metadata: { artist: 'My Podcast', title: 'Episode 42' },
  startAt: 754000 // 12:34
});
setPlaybackRate(0, 1.25);
seekBy(0, -15000);

onAudioProgress(0, (info) => localStorage.setItem('ep42', String(info.currentTime)));
disconnect();
```

## Music players and playlists

```ts
setRepeatMode(0, 'all');
setCrossfade(0, 4000);
await queueAudio('/music/a.mp3', 0, { metadata: { artist: 'X', title: 'A' } });
await queueAudio('/music/b.mp3', 0, { metadata: { artist: 'X', title: 'B' } });
await shuffleQueue(0);
console.log(getHistory(0).map((entry) => entry.fileName));
```

## Sleep timer and scheduled sounds

A timer is all you need.

```ts
setTimeout(() => void pauseAllWithFade(FadeType.Gentle, 3000), 30 * 60 * 1000);
setTimeout(() => void queueAudio('/sfx/reminder.mp3'), 5 * 60 * 1000);
```

## Pause when the tab is hidden

```ts
setQueueConfig({ pauseWhenHidden: true });
```
