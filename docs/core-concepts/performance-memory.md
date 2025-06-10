# Performance & Memory Management

Understanding performance optimization and memory management strategies for efficient audio applications.

## Performance Overview

The audio-channel-queue package is designed for high performance, but understanding optimization strategies will help you build more efficient audio applications. This guide covers memory management, CPU optimization, and best practices for different scenarios.

```typescript
import { 
  queueAudio, 
  setChannelVolume, 
  getCurrentAudioInfo, 
  getAllChannelsInfo, 
  getQueueSnapshot 
} from 'audio-channel-queue';

// Example: Performance monitoring
class AudioPerformanceMonitor {
  private startTime: number = Date.now();
  private memoryBaseline: number = 0;
  
  async monitorPerformance(): Promise<void> {
    console.log('🔍 Starting performance monitoring...');
    
    // Baseline memory usage
    if (performance.memory) {
      this.memoryBaseline = performance.memory.usedJSHeapSize;
    }
    
    // Monitor audio operations
    await this.performAudioOperations();
    
    // Check final performance
    this.reportPerformance();
  }
  
  private async performAudioOperations(): Promise<void> {
    // Queue multiple audio files
    const startQueue = performance.now();
    
    for (let i = 0; i < 10; i++) {
      await queueAudio(`./audio/track${i}.mp3`); // Using default channel 0
    }
    
    const queueTime = performance.now() - startQueue;
    console.log(`⏱️ Queuing 10 files took: ${queueTime.toFixed(2)}ms`);
  }
  
  private reportPerformance(): void {
    const totalTime = Date.now() - this.startTime;
    
    if (performance.memory) {
      const memoryUsed = performance.memory.usedJSHeapSize - this.memoryBaseline;
      console.log(`📊 Performance Report:`);
      console.log(`   Total time: ${totalTime}ms`);
      console.log(`   Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`);
    }
  }
}
```

## Memory Management

### Audio Element Lifecycle

The package automatically manages HTML audio elements, but understanding the lifecycle helps with optimization:

```typescript
class AudioMemoryManager {
  private channelUsage: Map<number, {
    elementCount: number;
    queueSize: number;
    lastActivity: number;
  }> = new Map();
  
  trackChannelUsage(): void {
    console.log('🧠 Tracking memory usage by channel...');
    
    // Monitor multiple channels
    for (let channel = 0; channel < 5; channel++) {
      this.updateChannelUsage(channel);
    }
    
    // Log usage report
    this.logMemoryUsage();
  }
  
  private updateChannelUsage(channel: number): void {
    const snapshot = channel === 0 ? getQueueSnapshot() : getQueueSnapshot(channel);
    const audioInfo = channel === 0 ? getCurrentAudioInfo() : getCurrentAudioInfo(channel);
    
    this.channelUsage.set(channel, {
      elementCount: audioInfo ? 1 : 0, // 1 if active, 0 if idle
      queueSize: snapshot.totalItems,
      lastActivity: snapshot.isChannelActive ? Date.now() : 0
    });
  }
  
  private logMemoryUsage(): void {
    console.log('\n📊 Channel Memory Usage:');
    
    for (const [channel, usage] of this.channelUsage) {
      const status = usage.elementCount > 0 ? 'Active' : 'Idle';
      const lastActivity = usage.lastActivity > 0 
        ? `${Date.now() - usage.lastActivity}ms ago` 
        : 'Never';
      
      console.log(`  Channel ${channel}: ${status}`);
      console.log(`    Queue size: ${usage.queueSize} items`);
      console.log(`    Last activity: ${lastActivity}`);
    }
  }
  
  getMemoryFootprint(): {
    activeChannels: number;
    totalQueueItems: number;
    estimatedMemoryKB: number;
  } {
    let activeChannels = 0;
    let totalQueueItems = 0;
    
    for (const usage of this.channelUsage.values()) {
      if (usage.elementCount > 0) activeChannels++;
      totalQueueItems += usage.queueSize;
    }
    
    // Rough estimate: ~50KB per active channel + ~5KB per queued item
    const estimatedMemoryKB = (activeChannels * 50) + (totalQueueItems * 5);
    
    return { activeChannels, totalQueueItems, estimatedMemoryKB };
  }
}
```

### Queue Size Optimization

Manage queue sizes to prevent memory bloat:

```typescript
class QueueOptimizer {
  private readonly maxQueueSize: number = 10;
  private readonly warningThreshold: number = 7;
  
  async optimizeQueues(): Promise<void> {
    console.log('🎯 Optimizing queue sizes...');
    
    // Check all channels for optimization opportunities
    for (let channel = 0; channel < 5; channel++) {
      await this.optimizeChannel(channel);
    }
  }
  
  private async optimizeChannel(channel: number): Promise<void> {
    const snapshot = channel === 0 ? getQueueSnapshot() : getQueueSnapshot(channel);
    
    if (snapshot.totalItems === 0) {
      // Channel is idle - no optimization needed
      return;
    }
    
    if (snapshot.totalItems >= this.maxQueueSize) {
      console.warn(`⚠️ Channel ${channel} queue at capacity (${snapshot.totalItems} items)`);
      await this.handleOverloadedQueue(channel);
    } else if (snapshot.totalItems >= this.warningThreshold) {
      console.log(`📈 Channel ${channel} queue approaching capacity (${snapshot.totalItems} items)`);
      this.handleWarningThreshold(channel);
    }
  }
  
  private async handleOverloadedQueue(channel: number): Promise<void> {
    console.log(`🚨 Handling overloaded queue on channel ${channel}`);
    
    // Option 1: Stop current audio to clear queue faster
    // if (channel === 0) {
    //   stopCurrentAudioInChannel();
    // } else {
    //   stopCurrentAudioInChannel(channel);
    // }
    
    // Option 2: Log warning and let queue naturally drain
    console.log('Queue will drain naturally - consider reducing queue rate');
    
    // Option 3: Implement smart queue management
    this.implementSmartQueue(channel);
  }
  
  private handleWarningThreshold(channel: number): void {
    console.log(`⚡ Channel ${channel} entering warning threshold`);
    // Could implement rate limiting or preemptive queue management
  }
  
  private implementSmartQueue(channel: number): void {
    // Smart queue management - could implement:
    // - Priority-based item removal
    // - Queue compaction
    // - Dynamic queue size limits
    console.log(`🧠 Implementing smart queue management for channel ${channel}`);
  }
  
  getOptimizationReport(): {
    [channel: number]: {
      queueSize: number;
      status: 'optimal' | 'warning' | 'critical';
      recommendation: string;
    };
  } {
    const report: any = {};
    
    for (let channel = 0; channel < 5; channel++) {
      const snapshot = channel === 0 ? getQueueSnapshot() : getQueueSnapshot(channel);
      let status: 'optimal' | 'warning' | 'critical';
      let recommendation: string;
      
      if (snapshot.totalItems >= this.maxQueueSize) {
        status = 'critical';
        recommendation = 'Reduce queue input rate or clear queue';
      } else if (snapshot.totalItems >= this.warningThreshold) {
        status = 'warning';
        recommendation = 'Monitor queue growth closely';
      } else {
        status = 'optimal';
        recommendation = 'Queue size is optimal';
      }
      
      report[channel] = {
        queueSize: snapshot.totalItems,
        status,
        recommendation
      };
    }
    
    return report;
  }
}
```

## CPU Performance Optimization

### Event Handler Optimization

Optimize event handlers to reduce CPU load:

```typescript
class EventOptimizer {
  private progressThrottle: number = 100; // Update every 100ms
  private lastProgressUpdate: Map<number, number> = new Map();
  private batchedUpdates: Map<number, any> = new Map();
  
  setupOptimizedEventHandlers(): void {
    console.log('⚡ Setting up optimized event handlers...');
    
    // Optimized progress handlers
    for (let channel = 0; channel < 3; channel++) {
      this.setupThrottledProgress(channel);
      this.setupBatchedQueueUpdates(channel);
    }
  }
  
  private setupThrottledProgress(channel: number): void {
    onAudioProgress(channel, (info) => {
      const now = Date.now();
      const lastUpdate = this.lastProgressUpdate.get(channel) || 0;
      
      // Throttle progress updates
      if (now - lastUpdate >= this.progressThrottle) {
        this.lastProgressUpdate.set(channel, now);
        this.handleOptimizedProgress(channel, info);
      }
    });
  }
  
  private setupBatchedQueueUpdates(channel: number): void {
    onQueueChange(channel, (snapshot) => {
      // Batch queue updates to avoid excessive UI updates
      this.batchedUpdates.set(channel, snapshot);
      
      // Process batched updates after a short delay
      setTimeout(() => {
        this.processBatchedUpdates();
      }, 50);
    });
  }
  
  private handleOptimizedProgress(channel: number, info: AudioProgressInfo): void {
    // Lightweight progress handling
    const percentage = Math.round(info.progress * 100);
    
    // Only update UI for significant changes
    if (percentage % 5 === 0) {
      this.updateProgressUI(channel, percentage);
    }
  }
  
  private processBatchedUpdates(): void {
    for (const [channel, snapshot] of this.batchedUpdates) {
      this.updateQueueUI(channel, snapshot);
    }
    
    this.batchedUpdates.clear();
  }
  
  private updateProgressUI(channel: number, percentage: number): void {
    // Efficient UI update
    console.log(`Progress Channel ${channel}: ${percentage}%`);
  }
  
  private updateQueueUI(channel: number, snapshot: QueueSnapshot): void {
    // Efficient queue UI update
    console.log(`Queue Channel ${channel}: ${snapshot.totalItems} items`);
  }
}
```

### Batch Operations

Perform batch operations for better performance:

```typescript
class BatchOperationManager {
  async performBatchOperations(): Promise<void> {
    console.log('🔄 Performing batch operations...');
    
    const startTime = performance.now();
    
    // Batch audio queueing
    await this.batchQueueAudio();
    
    // Batch volume adjustments
    this.batchVolumeAdjustments();
    
    // Batch information retrieval
    this.batchInformationRetrieval();
    
    const endTime = performance.now();
    console.log(`⏱️ Batch operations completed in ${(endTime - startTime).toFixed(2)}ms`);
  }
  
  private async batchQueueAudio(): Promise<void> {
    const audioFiles = [
      './audio/track1.mp3',
      './audio/track2.mp3',
      './audio/track3.mp3',
      './audio/track4.mp3',
      './audio/track5.mp3'
    ];
    
    // Queue all files simultaneously for better performance
    const queuePromises = audioFiles.map((file, index) => {
      const channel = Math.floor(index / 2);
      return channel === 0 ? queueAudio(file) : queueAudio(file, channel);
    });
    
    await Promise.all(queuePromises);
    console.log(`✓ Batch queued ${audioFiles.length} files`);
  }
  
  private batchVolumeAdjustments(): void {
    // Batch volume changes to reduce individual operations
    const volumeChanges = [
      { channel: 0, volume: 0.8 },
      { channel: 1, volume: 0.6 },
      { channel: 2, volume: 1.0 },
      { channel: 3, volume: 0.4 }
    ];
    
    volumeChanges.forEach(({ channel, volume }) => {
      setChannelVolume(channel, volume);
    });
    
    console.log(`✓ Batch adjusted ${volumeChanges.length} channel volumes`);
  }
  
  private batchInformationRetrieval(): void {
    // Retrieve information for multiple channels efficiently
    const channels = [0, 1, 2, 3, 4];
    
    const channelData = channels.map(channel => ({
      channel,
      audioInfo: channel === 0 ? getCurrentAudioInfo() : getCurrentAudioInfo(channel),
      queueSnapshot: channel === 0 ? getQueueSnapshot() : getQueueSnapshot(channel)
    }));
    
    console.log(`✓ Retrieved information for ${channelData.length} channels`);
    
    // Process the data efficiently
    const activeChannels = channelData.filter(data => data.audioInfo !== null);
    const totalQueueItems = channelData.reduce(
      (sum, data) => sum + data.queueSnapshot.totalItems, 
      0
    );
    
    console.log(`   Active channels: ${activeChannels.length}`);
    console.log(`   Total queue items: ${totalQueueItems}`);
  }
}
```

## Platform-Specific Optimizations

### Mobile Performance

Optimize for mobile devices with limited resources:

```typescript
class MobileOptimizer {
  private isMobile: boolean;
  private maxChannels: number;
  private maxQueueSize: number;
  
  constructor() {
    this.isMobile = this.detectMobile();
    this.maxChannels = this.isMobile ? 3 : 8;
    this.maxQueueSize = this.isMobile ? 5 : 15;
    
    console.log(`📱 Mobile optimization: ${this.isMobile ? 'Enabled' : 'Disabled'}`);
  }
  
  private detectMobile(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  setupMobileOptimizations(): void {
    if (!this.isMobile) {
      console.log('💻 Desktop mode - using full performance profile');
      return;
    }
    
    console.log('📱 Mobile mode - applying performance optimizations');
    
    this.limitChannelUsage();
    this.optimizeQueueSizes();
    this.setupMobileEventHandling();
    this.optimizeMemoryUsage();
  }
  
  private limitChannelUsage(): void {
    console.log(`🔢 Limiting to ${this.maxChannels} channels for mobile`);
    
    // Track channel usage and warn if exceeded
    setInterval(() => {
      this.checkChannelUsage();
    }, 5000);
  }
  
  private checkChannelUsage(): void {
    const allChannelsInfo = getAllChannelsInfo();
    const activeChannels = Object.keys(allChannelsInfo).length;
    
    if (activeChannels > this.maxChannels) {
      console.warn(`⚠️ Using ${activeChannels} channels, recommended max: ${this.maxChannels}`);
    }
  }
  
  private optimizeQueueSizes(): void {
    console.log(`📋 Limiting queue size to ${this.maxQueueSize} items for mobile`);
    
    // Monitor queue sizes across channels
    setInterval(() => {
      for (let channel = 0; channel < this.maxChannels; channel++) {
        const snapshot = getQueueSnapshot(channel);
        
        if (snapshot.totalItems > this.maxQueueSize) {
          console.warn(`⚠️ Channel ${channel} queue (${snapshot.totalItems}) exceeds mobile limit (${this.maxQueueSize})`);
        }
      }
    }, 3000);
  }
  
  private setupMobileEventHandling(): void {
    // More aggressive throttling for mobile
    const mobileProgressThrottle = 200; // Update every 200ms instead of 100ms
    
    for (let channel = 0; channel < this.maxChannels; channel++) {
      let lastUpdate = 0;
      
      onAudioProgress(channel, (info) => {
        const now = Date.now();
        
        if (now - lastUpdate >= mobileProgressThrottle) {
          lastUpdate = now;
          this.handleMobileProgress(channel, info);
        }
      });
    }
  }
  
  private handleMobileProgress(channel: number, info: AudioProgressInfo): void {
    // Lightweight progress handling for mobile
    const percentage = Math.round(info.progress * 100);
    
    // Only update for larger increments on mobile
    if (percentage % 10 === 0) {
      console.log(`📱 Mobile Progress ${channel}: ${percentage}%`);
    }
  }
  
  private optimizeMemoryUsage(): void {
    // More frequent cleanup on mobile
    setInterval(() => {
      this.performMobileCleanup();
    }, 10000); // Every 10 seconds
  }
  
  private performMobileCleanup(): void {
    // Force garbage collection if available (Chrome)
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
    
    // Log memory usage if available
    if (performance.memory) {
      const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      console.log(`📊 Mobile Memory: ${memoryMB.toFixed(1)} MB`);
      
      if (memoryMB > 50) { // Alert if using more than 50MB
        console.warn('⚠️ High memory usage detected on mobile device');
      }
    }
  }
  
  getMobilePerformanceReport(): {
    isMobile: boolean;
    maxChannels: number;
    maxQueueSize: number;
    currentMemoryMB: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    if (this.isMobile) {
      recommendations.push(`Limit to ${this.maxChannels} channels`);
      recommendations.push(`Keep queue sizes under ${this.maxQueueSize} items`);
      recommendations.push('Use throttled event handlers');
      recommendations.push('Monitor memory usage closely');
    }
    
    return {
      isMobile: this.isMobile,
      maxChannels: this.maxChannels,
      maxQueueSize: this.maxQueueSize,
      currentMemoryMB: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
      recommendations
    };
  }
}
```

## Performance Monitoring

### Real-time Performance Tracking

Monitor performance in real-time to catch issues early:

```typescript
class RealTimePerformanceMonitor {
  private metrics = {
    startTime: Date.now(),
    operationCount: 0,
    averageOperationTime: 0,
    memoryPeakMB: 0,
    errorCount: 0,
    lastGCTime: 0
  };
  
  private operationTimes: number[] = [];
  private maxOperationHistory = 100;
  
  startMonitoring(): void {
    console.log('🔍 Starting real-time performance monitoring...');
    
    this.setupPerformanceHooks();
    this.startPeriodicReporting();
    this.setupMemoryMonitoring();
  }
  
  private setupPerformanceHooks(): void {
    // Wrap audio operations to measure performance
    this.hookAudioOperations();
    
    // Monitor for performance issues
    this.setupPerformanceAlerts();
  }
  
  private hookAudioOperations(): void {
    // This is conceptual - in practice you'd wrap the operations
    console.log('🎣 Hooking audio operations for performance measurement');
    
    // Example: Measure queue operations
    const originalQueueAudio = queueAudio;
    
    // Note: This is just for demonstration - don't actually override the function
    // window.queueAudio = async (...args) => {
    //   const start = performance.now();
    //   const result = await originalQueueAudio(...args);
    //   const duration = performance.now() - start;
    //   this.recordOperation(duration);
    //   return result;
    // };
  }
  
  private recordOperation(duration: number): void {
    this.metrics.operationCount++;
    this.operationTimes.push(duration);
    
    // Keep only recent operations
    if (this.operationTimes.length > this.maxOperationHistory) {
      this.operationTimes.shift();
    }
    
    // Calculate rolling average
    this.metrics.averageOperationTime = 
      this.operationTimes.reduce((a, b) => a + b, 0) / this.operationTimes.length;
    
    // Alert for slow operations
    if (duration > 100) { // Operations taking more than 100ms
      console.warn(`⚠️ Slow operation detected: ${duration.toFixed(2)}ms`);
    }
  }
  
  private setupPerformanceAlerts(): void {
    // Alert for performance degradation
    setInterval(() => {
      if (this.metrics.averageOperationTime > 50) {
        console.warn(`⚠️ Performance degradation: avg operation time ${this.metrics.averageOperationTime.toFixed(2)}ms`);
      }
    }, 5000);
  }
  
  private startPeriodicReporting(): void {
    setInterval(() => {
      this.generatePerformanceReport();
    }, 30000); // Every 30 seconds
  }
  
  private setupMemoryMonitoring(): void {
    setInterval(() => {
      if (performance.memory) {
        const currentMemoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
        
        if (currentMemoryMB > this.metrics.memoryPeakMB) {
          this.metrics.memoryPeakMB = currentMemoryMB;
        }
        
        // Alert for memory leaks
        if (currentMemoryMB > 100) { // More than 100MB
          console.warn(`⚠️ High memory usage: ${currentMemoryMB.toFixed(1)} MB`);
        }
      }
    }, 2000);
  }
  
  private generatePerformanceReport(): void {
    const uptime = Date.now() - this.metrics.startTime;
    const operationsPerSecond = this.metrics.operationCount / (uptime / 1000);
    
    console.log('\n📊 Performance Report:');
    console.log(`   Uptime: ${Math.round(uptime / 1000)}s`);
    console.log(`   Operations: ${this.metrics.operationCount} (${operationsPerSecond.toFixed(2)}/s)`);
    console.log(`   Avg operation time: ${this.metrics.averageOperationTime.toFixed(2)}ms`);
    console.log(`   Memory peak: ${this.metrics.memoryPeakMB.toFixed(1)} MB`);
    console.log(`   Errors: ${this.metrics.errorCount}`);
    
    // Performance score
    const performanceScore = this.calculatePerformanceScore();
    console.log(`   Performance score: ${performanceScore}/100`);
  }
  
  private calculatePerformanceScore(): number {
    let score = 100;
    
    // Deduct for slow operations
    if (this.metrics.averageOperationTime > 50) {
      score -= 20;
    } else if (this.metrics.averageOperationTime > 25) {
      score -= 10;
    }
    
    // Deduct for high memory usage
    if (this.metrics.memoryPeakMB > 100) {
      score -= 30;
    } else if (this.metrics.memoryPeakMB > 50) {
      score -= 15;
    }
    
    // Deduct for errors
    score -= this.metrics.errorCount * 5;
    
    return Math.max(0, score);
  }
  
  getDetailedMetrics(): typeof this.metrics & {
    operationTimes: number[];
    currentMemoryMB: number;
    performanceScore: number;
  } {
    return {
      ...this.metrics,
      operationTimes: [...this.operationTimes],
      currentMemoryMB: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
      performanceScore: this.calculatePerformanceScore()
    };
  }
}
```

## Best Practices Summary

### General Performance Guidelines

```typescript
class PerformanceBestPractices {
  static getRecommendations(): {
    category: string;
    recommendations: string[];
  }[] {
    return [
      {
        category: 'Queue Management',
        recommendations: [
          'Keep queue sizes under 10-15 items for optimal performance',
          'Use priority queuing sparingly to avoid frequent interruptions',
          'Monitor queue growth and implement throttling if needed',
          'Clear unused queues periodically'
        ]
      },
      {
        category: 'Event Handling',
        recommendations: [
          'Throttle progress event handlers to 100ms intervals',
          'Batch UI updates to reduce DOM manipulation',
          'Use lightweight event handlers for high-frequency events',
          'Clean up event listeners when components unmount'
        ]
      },
      {
        category: 'Memory Management',
        recommendations: [
          'Limit simultaneous active channels (3-4 for mobile, 8-10 for desktop)',
          'Monitor memory usage in long-running applications',
          'Avoid memory leaks by properly managing event listeners',
          'Use performance.memory API for memory monitoring'
        ]
      },
      {
        category: 'Mobile Optimization',
        recommendations: [
          'Use more conservative limits on mobile devices',
          'Implement longer throttling intervals for events',
          'Monitor battery usage and thermal throttling',
          'Test thoroughly on various mobile devices'
        ]
      },
      {
        category: 'Development & Testing',
        recommendations: [
          'Use performance profiling tools during development',
          'Test with realistic audio file sizes and quantities',
          'Monitor performance metrics in production',
          'Implement fallback strategies for low-performance devices'
        ]
      }
    ];
  }
  
  static logRecommendations(): void {
    console.log('🎯 Audio Channel Queue Performance Best Practices:\n');
    
    this.getRecommendations().forEach(({ category, recommendations }) => {
      console.log(`📋 ${category}:`);
      recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
      console.log('');
    });
  }
}

// Usage
PerformanceBestPractices.logRecommendations();
```

## Next Steps

Now that you understand performance and memory management, explore:

- **[API Reference](../api-reference/queue-management)** - Complete function documentation
- **[Examples](../getting-started/basic-usage)** - Performance-optimized real-world examples
- **[Advanced Features](../advanced/volume-ducking)** - Complex optimization scenarios
- **[Migration & Help](../migration/troubleshooting)** - Upgrading and troubleshooting guides 