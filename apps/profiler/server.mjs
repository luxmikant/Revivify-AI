import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for profiling data
let profileData = {
  samples: [],
  timestamps: [],
  snapshot: null,
  metadata: {
    startTime: Date.now(),
    endTime: null,
    duration: 0,
  },
};

/**
 * Parse V8 profiling data into a format suitable for flame graph visualization
 */
function parseProfileData(isolateLog) {
  const lines = isolateLog.split('\n');
  const samples = [];
  const callStacks = new Map();

  let currentStack = [];

  for (const line of lines) {
    if (line.startsWith('code-creation,')) {
      const parts = line.split(',');
      if (parts.length >= 4) {
        const addr = parts[1];
        const kind = parts[2];
        const name = parts[3];
        callStacks.set(addr, { kind, name });
      }
    } else if (line.startsWith('tick,')) {
      const parts = line.split(',');
      const stack = [];
      for (let i = 2; i < parts.length; i++) {
        const func = callStacks.get(parts[i]) || { name: parts[i] };
        stack.push(func.name);
      }
      if (stack.length > 0) {
        samples.push(stack);
      }
    }
  }

  return samples;
}

/**
 * Convert samples to flame graph format (nested structure)
 */
function samplesToFlameGraph(samples) {
  const root = {
    name: 'root',
    value: 0,
    children: new Map(),
  };

  samples.forEach((stack) => {
    let current = root;
    current.value += 1;

    for (const func of stack) {
      if (!current.children.has(func)) {
        current.children.set(func, {
          name: func,
          value: 0,
          children: new Map(),
        });
      }
      current = current.children.get(func);
      current.value += 1;
    }
  });

  // Convert to array format for visualization
  function toArray(node) {
    return {
      name: node.name,
      value: node.value,
      children: Array.from(node.children.values()).map(toArray),
    };
  }

  return toArray(root);
}

/**
 * Collect profiling data from Node process
 */
app.post('/api/profile/data', (req, res) => {
  const { isolateLog, timestamp } = req.body;

  if (!isolateLog) {
    return res.status(400).json({ error: 'No profile data provided' });
  }

  try {
    const samples = parseProfileData(isolateLog);
    const flameGraph = samplesToFlameGraph(samples);

    profileData.samples = samples;
    profileData.timestamps.push(timestamp || Date.now());
    profileData.snapshot = flameGraph;
    profileData.metadata.endTime = Date.now();
    profileData.metadata.duration = profileData.metadata.endTime - profileData.metadata.startTime;

    res.json({
      success: true,
      samplesProcessed: samples.length,
      graphNodes: countNodes(flameGraph),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get current flame graph data
 */
app.get('/api/profile/graph', (req, res) => {
  res.json(profileData.snapshot || { name: 'root', value: 0, children: [] });
});

/**
 * Get profiling metadata
 */
app.get('/api/profile/metadata', (req, res) => {
  res.json(profileData.metadata);
});

/**
 * Reset profiling data
 */
app.post('/api/profile/reset', (req, res) => {
  profileData = {
    samples: [],
    timestamps: [],
    snapshot: null,
    metadata: {
      startTime: Date.now(),
      endTime: null,
      duration: 0,
    },
  };
  res.json({ success: true, message: 'Profile data reset' });
});

/**
 * Mock API endpoint for testing (generates synthetic profile data)
 */
app.post('/api/profile/generate-mock', (req, res) => {
  const mockSamples = generateMockSamples();
  const flameGraph = samplesToFlameGraph(mockSamples);

  profileData.samples = mockSamples;
  profileData.timestamps.push(Date.now());
  profileData.snapshot = flameGraph;
  profileData.metadata.endTime = Date.now();
  profileData.metadata.duration = 5000; // 5 second mock profile

  res.json({
    success: true,
    samplesProcessed: mockSamples.length,
    graphNodes: countNodes(flameGraph),
  });
});

/**
 * Serve the visualization page
 */
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

/**
 * Helper: Count nodes in flame graph
 */
function countNodes(node, count = 0) {
  count += 1;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count = countNodes(child, count);
    }
  }
  return count;
}

/**
 * Generate mock profiling data for testing
 */
function generateMockSamples() {
  const functions = [
    'main',
    'express',
    'middleware',
    'route',
    'analyzeResume',
    'parseJD',
    'calculateScore',
    'aiModel',
    'database',
    'cache',
    'json',
    'buffer',
  ];

  const samples = [];
  for (let i = 0; i < 1000; i++) {
    const stackLength = Math.floor(Math.random() * 8) + 3;
    const stack = [];
    for (let j = 0; j < stackLength; j++) {
      stack.push(functions[Math.floor(Math.random() * functions.length)]);
    }
    samples.push(stack);
  }
  return samples;
}

app.listen(PORT, () => {
  console.log(`\n🔥 Flame Graph Viewer ready at http://localhost:${PORT}\n`);
  console.log('📊 Features:');
  console.log('  • Interactive flame graph visualization');
  console.log('  • Real-time profiling data');
  console.log('  • Click to zoom, drag to move');
  console.log(`\n🧪 Test it: http://localhost:${PORT}`);
  console.log('   Generate mock data button included\n');
});
