---
sidebar_position: 1
title: Installation
description: Install AudioQ and import it in any browser project
---

# Installation

```bash
npm install audioq
# or
yarn add audioq
# or
pnpm add audioq
```

AudioQ has **no runtime dependencies** and ships TypeScript types, so there is nothing else to
install.

## Importing

The package ships both ES modules and CommonJS, and bundlers pick the right one automatically.
It is marked side-effect free, so bundlers drop the parts you do not import.

```ts
import { queueAudio, createAudioQueue, FadeType } from 'audioq';
```

```bash
# CommonJS (older tooling) works too:
# const { queueAudio } = require('audioq');
```

Importing AudioQ never touches browser APIs, so it is safe in server-side rendering (Next.js,
Nuxt, SvelteKit, Remix). Audio is only created when you call `queueAudio` in the browser.

## Where to put audio files

Any URL the browser can play works: files served by your app, a CDN, `blob:` URLs, `data:` URIs,
or a `Blob`/`File` object.

| Setup                           | Where files go        | URL to use                      |
| ------------------------------- | --------------------- | ------------------------------- |
| Vite, Create React App, Next.js | `public/sounds/x.mp3` | `/sounds/x.mp3`                 |
| Bundler import                  | next to your code     | `import url from './x.mp3'`     |
| CDN                             | anywhere              | `https://cdn.example.com/x.mp3` |
| Generated or uploaded audio     | in memory             | pass the `Blob` itself          |

If the audio lives on another domain and you need volume control on iOS, see
[iOS and Web Audio](../api-reference/configuration#ios-and-web-audio).

## Requirements

- Browsers from 2020 onwards: Chrome and Edge 80+, Firefox 74+, Safari 13.1+, and their mobile
  versions. See [Browser Compatibility](browser-compatibility).
- Developing AudioQ itself needs Node.js 20.19+, 22.13+ or 24+. Using it does not.
