---
sidebar_position: 4
title: Sprites, Segments and Cues
description: Play parts of a file, pack sounds into sprites, and fire events at moments in a track
---

# Sprites, Segments and Cues

## Segments

`startAt` and `endAt` (milliseconds) play one part of a file. Reaching `endAt` counts as the end
of the item. With `loop: true` the segment repeats.

```ts
await queueAudio('/voice/all-lines.mp3', 2, { endAt: 4200, startAt: 3000 });
await queueAudio('/ambience/forest.mp3', 0, { endAt: 30000, loop: true, startAt: 5000 });
```

Segment ends are timed precisely (not at the browser's roughly 4-per-second position updates), so
even 100 ms sounds stop on time.

## Audio sprites

A sprite is one file containing many short sounds. One download serves every sound, which suits
games and UI feedback.

```ts signature
defineSprite(source: string, map: Record<string, SpriteSegment>, queue?: AudioQueue): AudioSprite
```

Each segment is `[startMs, endMs]` or `{ startMs, endMs, loop }`.

```ts
const sfx = defineSprite('/sfx/sprite.mp3', {
  coin: [0, 300],
  engine: { endMs: 4000, loop: true, startMs: 1000 },
  jump: [400, 900]
});

console.log(sfx.names); // ['coin', 'engine', 'jump']
await sfx.play('coin', 1);
await sfx.play('jump', 1, { interrupt: true, volume: 0.7 });
await sfx.play('engine', 2);
```

`play(name, channel?, options?)` accepts every `queueAudio` option. Sounds on one channel play in
order: use `interrupt: true` so rapid sounds cut each other off, or several channels so they
overlap. `defineSprite` is a separate function, so apps that do not use it do not ship it.

## Cues

Cues fire `onAudioCue` events at moments in a track: captions, karaoke lyrics, lip-sync, quiz
prompts, or animations.

```ts
interface AudioCue {
  startMs: number; // from the start of the file
  endMs?: number; // a range; without it the cue is a point
  text?: string;
  data?: unknown; // anything you want back
}
```

```ts
onAudioCue(1, ({ active, cue }) => {
  if (active) console.log('show caption:', cue.text);
  else console.log('hide caption');
});

await queueAudio('/voice/intro.mp3', 1, {
  cues: [
    { endMs: 2400, startMs: 0, text: 'Welcome back!' },
    { endMs: 5200, startMs: 2600, text: 'Here is what is new.' },
    { data: { animation: 'wave' }, startMs: 2600 }
  ]
});
```

- **Ranged cues** (with `endMs`) fire with `active: true` when playback enters them and
  `active: false` when it leaves, including when the item stops or ends.
- **Point cues** fire once when playback passes them.
- Cues follow seeks: seeking into a range enters it; seeking back replays point cues.
- Each event (`AudioCueInfo`) includes the cue (your object), its `index`, and the item's `id`,
  `src`, `fileName` and `metadata`.

```ts
offAudioCue(1);
```

## WebVTT captions

```ts signature
parseWebVtt(text: string): AudioCue[]
parseVttTimestamp(timestamp: string): number
```

Converts a `.vtt` caption file into cues. Caption identifiers become the cue's `data`.

```ts
const vtt = await (await fetch('/captions/intro.vtt')).text();
await queueAudio('/voice/intro.mp3', 1, { cues: parseWebVtt(vtt) });
console.log(parseVttTimestamp('01:02.500')); // 62500
```
