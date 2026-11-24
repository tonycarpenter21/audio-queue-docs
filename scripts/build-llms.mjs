/**
 * Writes static/llms.txt and static/llms-full.txt (https://llmstxt.org) from the docs, so AI
 * assistants and coding agents can read AudioQ's documentation as plain text. Runs before every
 * build, so the files always match the pages.
 *   llms.txt       a summary with a link and description for every page, in sidebar order
 *   llms-full.txt  every page's Markdown in one file
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://tonycarpenter21.github.io/audio-queue-docs';

// Page ids in sidebar order (sidebars.ts lists them as quoted strings).
const sidebar = readFileSync(join(root, 'sidebars.ts'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !/^\s*\/\//.test(line))
  .join('\n');
// Other quoted words ('category') are not pages: keep the ones that have a file.
const ids = [...sidebar.matchAll(/'([a-z0-9-]+(?:\/[a-z0-9-]+)*)'/g)]
  .map((match) => match[1])
  .filter((id, index, all) => all.indexOf(id) === index && existsSync(join(root, 'docs', `${id}.md`)));

const pages = ids.map((id) => {
  const text = readFileSync(join(root, 'docs', `${id}.md`), 'utf8');
  const frontMatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  const field = (name) => frontMatter?.[1].match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim();
  return {
    // Badge rows and other HTML blocks are noise for a language model.
    body: text
      .slice(frontMatter?.[0].length ?? 0)
      .replace(/^<div[\s\S]*?^<\/div>\n?/gm, '')
      .trim(),
    description: field('description') ?? '',
    title: field('title') ?? id,
    url: `${SITE}/${id === 'intro' ? '' : id}`
  };
});

const sections = new Map();
for (const page of pages) {
  const id = ids[pages.indexOf(page)];
  const section = id.includes('/') ? id.split('/')[0] : 'overview';
  sections.set(section, [...(sections.get(section) ?? []), page]);
}
const SECTION_TITLES = {
  'api-reference': 'API reference',
  'core-concepts': 'Core concepts',
  'getting-started': 'Getting started',
  migration: 'Migration and help',
  overview: 'Overview'
};

const summary = [
  '# AudioQ',
  '',
  '> AudioQ (npm: audioq) is a zero-dependency TypeScript library for queueing audio in the browser:',
  '> independent channels that each play their queue in order, with pause/resume and fades, volume,',
  '> muting, ducking, stereo panning, crossfades, playlists (repeat, shuffle, gaps, seek, speed,',
  '> history), audio sprites, timed cues and WebVTT captions, preloading, lock-screen controls',
  '> (Media Session), visualizer data, and fixes for iOS and browser autoplay rules.',
  '',
  'Install with `npm install audioq`. Every function is a named export: `import { queueAudio } from',
  "'audioq'`. Channels are numbers (0 by default); sounds on one channel never overlap, sounds on",
  'different channels play together. Times are in milliseconds and volumes from 0 to 1.',
  'For independent queues, `import { createAudioQueue, queueAudio } from',
  "'audioq/queue'`: the same functions, with the queue as the first argument.",
  '',
  ...[...sections].flatMap(([section, list]) => [
    `## ${SECTION_TITLES[section] ?? section}`,
    '',
    ...list.map((page) => `- [${page.title}](${page.url}): ${page.description}`),
    ''
  ]),
  '## Optional',
  '',
  `- [Full documentation as one file](${SITE}/llms-full.txt): every page above, in order`,
  '- [Live demo](https://tonycarpenter21.github.io/audio-queue-demo/): every feature, with code',
  '- [Source](https://github.com/tonycarpenter21/audioq): README, CHANGELOG and MIGRATION guide',
  ''
].join('\n');

const full = [
  '# AudioQ documentation',
  '',
  `Source: ${SITE}/`,
  '',
  ...pages.map((page) => `---\n\n<!-- ${page.url} -->\n\n${page.body}\n`)
].join('\n');

writeFileSync(join(root, 'static', 'llms.txt'), summary);
writeFileSync(join(root, 'static', 'llms-full.txt'), full);
console.log(`llms.txt: ${pages.length} pages; llms-full.txt: ${Math.round(full.length / 1024)} KB`);
