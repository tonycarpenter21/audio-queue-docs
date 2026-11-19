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

## A "now playing" hook

```tsx
import { useEffect, useState } from 'react';
import { getCurrentAudioInfo, onAudioComplete, onAudioPause, onAudioResume, onAudioStart } from 'audioq';
import type { AudioInfo } from 'audioq';

export function useNowPlaying(channel = 0): AudioInfo | null {
  const [info, setInfo] = useState(() => getCurrentAudioInfo(channel));
  useEffect(() => {
    const update = () => setInfo(getCurrentAudioInfo(channel));
    const unsubscribers = [
      onAudioStart(channel, update),
      onAudioPause(channel, update),
      onAudioResume(channel, update),
      onAudioComplete(channel, update)
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [channel]);
  return info;
}
```

## Show the queue

```tsx
import { useEffect, useState } from 'react';
import { getQueueSnapshot, onQueueChange } from 'audioq';

export function QueueList({ channel = 0 }: { channel?: number }) {
  const [snapshot, setSnapshot] = useState(() => getQueueSnapshot(channel));
  useEffect(() => onQueueChange(channel, setSnapshot), [channel]);
  return (
    <ol>
      {snapshot?.items.map((item) => <li key={item.id}>{item.metadata?.title ?? item.fileName}</li>)}
    </ol>
  );
}
```

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
