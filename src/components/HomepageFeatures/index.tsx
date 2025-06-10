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
        Manage multiple independent audio queues simultaneously. Perfect for games, 
        applications, and complex audio experiences with separate channels for music, 
        sound effects, and voice.
      </>
    ),
    emoji: '🎛️',
    title: 'Multi-Channel Audio'
  },
  {
    description: (
      <>
        Full playback control with pause, resume, volume adjustment, and priority 
        queueing. Includes smooth fade transitions and volume ducking for 
        professional audio experiences.
      </>
    ),
    emoji: '⏯️',
    title: 'Real-Time Control'
  },
  {
    description: (
      <>
        Built with TypeScript and zero dependencies. Comprehensive type definitions, 
        extensive documentation, and a clean API make integration simple and reliable.
      </>
    ),
    emoji: '📘',
    title: 'TypeScript Ready'
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
