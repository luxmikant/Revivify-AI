/**
 * Bridge between the main API and the profiler visualizer
 * Use this to send profiling data from your Node.js server to the visualizer
 */

import fs from 'fs';

export interface ProfilerConfig {
  visualizerUrl?: string;
  enabled?: boolean;
  autoSend?: boolean;
}

const defaultConfig: ProfilerConfig = {
  visualizerUrl: 'http://localhost:3001',
  enabled: true,
  autoSend: true,
};

let config = { ...defaultConfig };

/**
 * Initialize profiler bridge
 */
export function initProfiler(customConfig: Partial<ProfilerConfig> = {}): void {
  config = { ...config, ...customConfig };
  console.log('📊 Profiler bridge initialized');
  console.log(`   Visualizer URL: ${config.visualizerUrl}`);
}

/**
 * Send profiling data to visualizer
 */
export async function sendProfileData(isolateLogPath: string, label?: string): Promise<void> {
  if (!config.enabled || !config.visualizerUrl) {
    console.warn('⚠️  Profiler is disabled or visualizer URL not set');
    return;
  }

  try {
    const data = fs.readFileSync(isolateLogPath, 'utf-8');

    const response = await fetch(`${config.visualizerUrl}/api/profile/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isolateLog: data,
        timestamp: Date.now(),
        label: label || 'Profile data from API',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Profile data sent to visualizer`);
      console.log(`   Samples processed: ${result.samplesProcessed}`);
      console.log(`   Graph nodes: ${result.graphNodes}`);
      console.log(`   View at: ${config.visualizerUrl}`);
    } else {
      console.error(`❌ Failed to send profile data: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error sending profile data:', error);
  }
}

/**
 * Setup automatic profiling listener
 */
export function setupAutoProfiler(): void {
  if (!config.autoSend) return;

  // Watch for isolate log files
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error);

    // Try to send any profiling data before exiting
    try {
      const isolateFiles = fs.readdirSync('.').filter((f) => f.startsWith('isolate-') && f.endsWith('.log'));
      if (isolateFiles.length > 0) {
        await sendProfileData(isolateFiles[0], 'Error profile');
      }
    } catch (e) {
      // Silently fail
    }

    process.exit(1);
  });

  console.log('🔍 Auto profiler setup complete');
}

/**
 * Reset profiler on visualizer
 */
export async function resetProfiler(): Promise<void> {
  if (!config.visualizerUrl) return;

  try {
    await fetch(`${config.visualizerUrl}/api/profile/reset`, {
      method: 'POST',
    });
    console.log('✨ Profiler data reset on visualizer');
  } catch (error) {
    console.error('Error resetting profiler:', error);
  }
}

export default {
  initProfiler,
  sendProfileData,
  setupAutoProfiler,
  resetProfiler,
};
