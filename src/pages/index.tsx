import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles['hero-banner'])}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          🔊 {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/getting-started/installation">
            Get Started
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            style={{ marginLeft: '1rem' }}
            to="https://tonycarpenter21.github.io/audio-queue-demo">
            View Live Demo
          </Link>
        </div>
        <div className={styles['quick-install']}>
          <code>npm install audioq</code>
        </div>
        <div className={styles['npm-shields']}>
          <a href="https://www.npmjs.com/package/audioq" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/npm/v/audioq?style=flat-square&logo=npm&label=version" alt="NPM Version" />
          </a>
          <a href="https://github.com/tonycarpenter21/audioq" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/github/stars/tonycarpenter21/audioq?style=flat-square&logo=github" alt="GitHub Stars" />
          </a>
          <a href="https://github.com/tonycarpenter21/audioq/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/npm/l/audioq?style=flat-square" alt="License" />
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      description="Multi-channel audio queue management for browsers with TypeScript support. Perfect for games, apps, and complex audio experiences."
      title={siteConfig.title}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
