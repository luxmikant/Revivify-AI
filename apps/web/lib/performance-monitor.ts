/**
 * React Frontend Performance Monitoring
 * Utilities for profiling React component rendering and performance
 */

export interface WebVitals {
  name: string;
  value: number;
  id: string;
  navigationType?: string;
}

export interface ComponentMetric {
  componentName: string;
  renderTime: number;
  timestamp: number;
  phase: 'mount' | 'update';
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, string | number | boolean>
    ) => void;
  }
}

const componentMetrics: ComponentMetric[] = [];

/**
 * Report Web Vitals (LCP, FID, CLS, etc.)
 */
export function reportWebVitals(metric: WebVitals): void {
  console.log(`📊 Web Vital: ${metric.name} = ${metric.value.toFixed(2)}`);

  // Send to analytics if needed
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: metric.value,
      event_category: 'web_vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

/**
 * Track component render time
 */
export function trackComponentRender(
  componentName: string,
  renderTime: number,
  phase: 'mount' | 'update' = 'update'
): void {
  const metric: ComponentMetric = {
    componentName,
    renderTime,
    timestamp: Date.now(),
    phase,
  };

  componentMetrics.push(metric);

  if (renderTime > 16.67) {
    // Longer than one frame (60fps)
    console.warn(
      `⚠️  Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (${phase})`
    );
  }
}

/**
 * Get performance metrics for a component
 */
export function getComponentMetrics(componentName?: string): ComponentMetric[] {
  if (!componentName) {
    return componentMetrics;
  }

  return componentMetrics.filter((m) => m.componentName === componentName);
}

/**
 * Calculate average render time
 */
export function getAverageRenderTime(componentName: string): number {
  const metrics = getComponentMetrics(componentName);

  if (metrics.length === 0) return 0;

  const total = metrics.reduce((sum, m) => sum + m.renderTime, 0);
  return total / metrics.length;
}

/**
 * Log performance summary
 */
export function logPerformanceSummary(): void {
  console.log('\n📈 Component Performance Summary:');
  console.log('─'.repeat(80));

  const byComponent = new Map<string, ComponentMetric[]>();

  componentMetrics.forEach((metric) => {
    if (!byComponent.has(metric.componentName)) {
      byComponent.set(metric.componentName, []);
    }
    byComponent.get(metric.componentName)!.push(metric);
  });

  byComponent.forEach((metrics, componentName) => {
    const avgTime = metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length;
    const maxTime = Math.max(...metrics.map((m) => m.renderTime));
    const minTime = Math.min(...metrics.map((m) => m.renderTime));

    console.log(`\n${componentName}:`);
    console.log(`  Count: ${metrics.length}`);
    console.log(`  Avg: ${avgTime.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
  });

  console.log('\n' + '─'.repeat(80));
}

/**
 * Clear metrics
 */
export function clearPerformanceMetrics(): void {
  componentMetrics.length = 0;
}

/**
 * React DevTools Profiler API integration
 */
export const useProfiler = (id: string) => {
  if (typeof window === 'undefined') return;

  const startMark = `${id}-start`;
  const endMark = `${id}-end`;
  const measureName = `${id}-duration`;

  return {
    start: () => {
      if (performance.mark) {
        performance.mark(startMark);
      }
    },
    end: () => {
      if (performance.mark && performance.measure) {
        performance.mark(endMark);
        try {
          performance.measure(measureName, startMark, endMark);
          const measure = performance.getEntriesByName(measureName)[0];
          if (measure) {
            trackComponentRender(id, measure.duration);
          }
        } catch (e) {
          console.error('Performance measurement failed:', e);
        }
      }
    },
  };
};

/**
 * Export metrics as JSON for analysis
 */
export function exportMetrics(): string {
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      componentMetrics,
    },
    null,
    2
  );
}
