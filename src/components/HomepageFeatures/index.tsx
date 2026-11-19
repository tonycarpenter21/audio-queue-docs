import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  description: ReactNode;
  emoji: string;
  title: string;
};

const FeatureList: FeatureItem[] = [
  {
    description: (
      <>
        Independent queues for music, sound effects and voice. Queue a file and it plays; the rest
        waits its turn. Volume ducking, fades and crossfades keep the mix clean.
      </>
    ),
    emoji: '🎛️',
    title: 'Multi-Channel Queues'
  },
  {
    description: (
      <>
        Repeat, shuffle, seek, speed, history and lock-screen controls for players. Sprites, timed
        cues and WebVTT captions for games and voice-overs.
      </>
    ),
    emoji: '⏯️',
    title: 'Players, Games and Voice'
  },
  {
    description: (
      <>
        Zero dependencies, about 11 KB gzipped, tree-shakable and safe to import on the server.
        Handles autoplay blocking, iOS volume and interruptions for you.
      </>
    ),
    emoji: '📘',
    title: 'Small and Typed'
  }
];

function Feature({ title, emoji, description }: FeatureItem): React.JSX.Element {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles['feature-emoji']}>{emoji}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
