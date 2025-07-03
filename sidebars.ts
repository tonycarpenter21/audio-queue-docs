import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/basic-usage',
        'getting-started/react-integration',
        'getting-started/browser-compatibility',
      ],
      label: 'Getting Started',
      type: 'category'
    },
    {
      items: [
        'core-concepts/audio-channels',
        'core-concepts/queue-system',
        'core-concepts/event-system',
        'core-concepts/audio-lifecycle',
        'core-concepts/performance-memory',
      ],
      label: 'Core Concepts',
      type: 'category'
    },
    {
      items: [
        'api-reference/quick-reference',
        'api-reference/queue-management',
        'advanced/advanced-queue-manipulation',
        'api-reference/volume-control',
        'advanced/volume-ducking',
        'api-reference/pause-resume',
        'api-reference/event-listeners',
        'api-reference/audio-information',
        'api-reference/error-handling',
        'api-reference/utilities',
        'api-reference/types-interfaces'
      ],
      label: 'API Reference',
      type: 'category'
    },
    {
      items: [
        'migration/troubleshooting',
      ],
      label: 'Migration & Help',
      type: 'category'
    }
  ]

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
