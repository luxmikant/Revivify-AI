/**
 * Performance Profiling Utilities
 * Helpers for monitoring and analyzing application performance
 */

export interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

const metrics: Map<string, PerformanceMetrics> = new Map();

/**
 * Start tracking performance for an operation
 */
export function startMetric(name: string): void {
  const memUsage = process.memoryUsage();
  metrics.set(name, {
    name,
    startTime: performance.now(),
    memory: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
    },
  });
}

/**
 * End tracking and get performance results
 */
export function endMetric(name: string): PerformanceMetrics | undefined {
  const metric = metrics.get(name);
  if (!metric) {
    console.warn(`Metric "${name}" not found`);
    return;
  }

  const endTime = performance.now();
  metric.endTime = endTime;
  metric.duration = endTime - metric.startTime;

  return metric;
}

/**
 * Log all collected metrics
 */
export function logMetrics(): void {
  console.log('\n📊 Performance Metrics:');
  console.log('─'.repeat(80));

  metrics.forEach((metric) => {
    if (metric.duration !== undefined) {
      console.log(`✓ ${metric.name}`);
      console.log(`  Duration: ${metric.duration.toFixed(2)}ms`);
      if (metric.memory) {
        console.log(`  Memory - Heap: ${(metric.memory.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(metric.memory.heapTotal / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  Memory - RSS: ${(metric.memory.rss / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  });
  console.log('─'.repeat(80));
}

/**
 * Decorator for automatic metric tracking
 */
export function trackPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]): Promise<any> {
    const metricName = `${target.constructor.name}.${propertyKey}`;
    startMetric(metricName);

    try {
      const result = await originalMethod.apply(this, args);
      const metric = endMetric(metricName);
      if (metric?.duration) {
        console.log(`⏱️  ${metricName}: ${metric.duration.toFixed(2)}ms`);
      }
      return result;
    } catch (error) {
      console.error(`❌ ${metricName} failed:`, error);
      throw error;
    }
  };

  return descriptor;
}

/**
 * Get a summary of all metrics
 */
export function getMetricsSummary(): Record<string, any> {
  const summary: Record<string, any> = {
    totalMetrics: metrics.size,
    metrics: Array.from(metrics.values())
      .filter((m) => m.duration !== undefined)
      .map((m) => ({
        name: m.name,
        duration: `${m.duration?.toFixed(2)}ms`,
      })),
  };

  return summary;
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics.clear();
}
