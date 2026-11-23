import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AudioQ',
  tagline: 'Queue audio in the browser: channels, playlists, sprites, captions and lock-screen controls',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://tonycarpenter21.github.io',
  baseUrl: '/audio-queue-docs/',

  // GitHub pages deployment config.
  organizationName: 'tonycarpenter21',
  projectName: 'audio-queue-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'throw',

  markdown: {
    mermaid: true
  },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Serve docs at the root
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/tonycarpenter21/audio-queue-docs/tree/main/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      {
        content:
          'audio queue, javascript audio, typescript audio library, web audio, playlist, audio sprite, sound effects, ducking, crossfade, captions, webvtt, media session, lock screen, ios audio, autoplay',
        name: 'keywords'
      },
      {
        content:
          'AudioQ: a zero-dependency TypeScript library for queueing audio in the browser, with channels, playlists, sprites, captions, ducking, crossfades and lock-screen controls.',
        name: 'description'
      }
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '🔊 AudioQ',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://www.npmjs.com/package/audioq',
          label: 'NPM Package',
          position: 'right',
        },
        {
          href: 'https://tonycarpenter21.github.io/audio-queue-demo',
          label: 'Live Demo',
          position: 'right',
        },
        {
          href: 'https://github.com/tonycarpenter21/audioq',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/installation',
            },
            {
              label: 'API Reference',
              to: '/api-reference/queue-management',
            },
            {
              label: 'Examples',
              to: '/getting-started/basic-usage',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'NPM Package',
              href: 'https://www.npmjs.com/package/audioq',
            },
            {
              label: 'Live Demo',
              href: 'https://tonycarpenter21.github.io/audio-queue-demo',
            },
            {
              label: 'GitHub Repository',
              href: 'https://github.com/tonycarpenter21/audioq',
            },
            {
              label: 'llms.txt (for AI assistants)',
              href: 'pathname:///llms.txt',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'Issues',
              href: 'https://github.com/tonycarpenter21/audioq/issues',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/tonycarpenter21/audioq/discussions',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AudioQ.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config; 