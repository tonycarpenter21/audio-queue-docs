---
sidebar_position: 4
title: React
description: Using AudioQ from React components and hooks
---

# React

AudioQ needs no React wrapper: every `on*` function returns an unsubscribe function, which is
exactly what `useEffect` wants back.

## Play a sound on click

```tsx
import { queueAudio } from 'audioq';

export function LikeButton() {
  return <button onClick={() => void queueAudio('/sfx/like.mp3', 1)}>Like</button>;
}
```

## Subscribe to events

```tsx
import { useEffect, useState } from 'react';
import { onAudioProgress } from 'audioq';

export function ProgressBar({ channel = 0 }: { channel?: number }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => onAudioProgress(channel, (info) => setProgress(info.progress)), [channel]);
  return <progress max={1} value={progress} />;
}
```

## Channel state as a store

`createChannelStore` exposes a channel as a store that React's `useSyncExternalStore` reads
directly: the component re-renders when the current item, its position, the pause state or the
queue changes, and never otherwise. Create stores once, outside components.

```tsx
import { useSyncExternalStore } from 'react';
import { createChannelStore } from 'audioq';

const music = createChannelStore(0);

export function NowPlaying() {
  const { current, isPaused, items } = useSyncExternalStore(music.subscribe, music.getSnapshot);
  if (!current) return <p>Nothing playing</p>;
  return (
    <div>
      <p>
        {current.metadata?.title ?? current.fileName} {isPaused ? '(paused)' : ''}
      </p>
      <progress max={1} value={current.progress} />
      <ol>
        {items.map((item) => (
          <li key={item.id}>{item.metadata?.title ?? item.fileName}</li>
        ))}
      </ol>
    </div>
  );
}
```

A hook for any channel (one store per channel number):

```tsx
import { useSyncExternalStore } from 'react';
import { createChannelStore } from 'audioq';
import type { ChannelState, ChannelStore } from 'audioq';

const stores = new Map<number, ChannelStore>();

export function useChannel(channel = 0): ChannelState {
  let store = stores.get(channel);
  if (!store) {
    store = createChannelStore(channel);
    stores.set(channel, store);
  }
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
```

The third argument makes it work with server rendering: the snapshot of an unused channel is
empty.

File names and metadata are plain text, so render them directly; React escapes them for you.

## Strict Mode and cleanup

`stopAllAudio`, `destroyChannel` and `destroyAllChannels` take effect immediately, even without
`await`, so they are safe in effect cleanups that React Strict Mode runs twice:

```tsx
useEffect(() => {
  void queueAudio('/music/menu.mp3', 0, { loop: true });
  return () => void stopAllAudioInChannel(0);
}, []);
```

## One queue per component tree

The top-level functions share one default queue. For an isolated player (or in tests), create a
queue and pass it down through context:

```tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createAudioQueue, type AudioQueue } from 'audioq';

const QueueContext = createContext<AudioQueue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const queue = useMemo(() => createAudioQueue({ historySize: 50 }), []);
  return <QueueContext.Provider value={queue}>{children}</QueueContext.Provider>;
}

export const useAudioQueue = (): AudioQueue => {
  const queue = useContext(QueueContext);
  if (!queue) throw new Error('useAudioQueue must be used inside <AudioProvider>');
  return queue;
};
```

## Server-side rendering

Importing AudioQ has no side effects, so it is safe in Next.js and other SSR frameworks. Call
`queueAudio` only in the browser (event handlers and effects already run there).

## Svelte, Vue and Solid

A channel store is a Svelte store as is:

```svelte
<script>
  import { createChannelStore } from 'audioq';
  const music = createChannelStore(0);
</script>

<p>{$music.current?.fileName ?? 'Nothing playing'}</p>
```

Vue and Solid take two lines:

```js
// Vue
const music = createChannelStore(0);
const state = shallowRef(music.getSnapshot());
onScopeDispose(music.subscribe((next) => (state.value = next)));

// Solid
const [state, setState] = createSignal(music.getSnapshot());
onCleanup(music.subscribe(setState));
```
