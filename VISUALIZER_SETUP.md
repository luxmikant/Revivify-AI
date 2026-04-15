# 🔥 Flame Graph Visualizer - Complete Setup Guide

## ✨ What You Have Now

A **standalone, browser-based flame graph viewer** for real-time performance profiling of Revivify AI.

```
Your Project Structure:
├── apps/
│   ├── api/              (Your backend)
│   ├── web/              (Your React frontend)
│   ├── prototype/        (Your prototype)
│   └── profiler/ ✨      (NEW - Visualizer)
├── start-profiler.bat    (Quick start - Windows)
└── start-profiler.sh     (Quick start - Mac/Linux)
```

---

## 🚀 Quick Start (Recommended)

### On Windows:
```cmd
# Double-click this file in File Explorer:
start-profiler.bat

# Or in Command Prompt:
start-profiler.bat
```

### On Mac/Linux:
```bash
# Run the shell script:
bash start-profiler.sh
```

### Manual Start:
```bash
cd apps/profiler
npm install
npm run dev
```

**Then open:** http://localhost:3001

---

## 📊 Using the Visualizer

### Step 1: Generate Sample Data
```
Click "📊 Generate Mock Data" button
↓
You'll see a beautiful interactive flame graph
```

### Step 2: Understand the Graph

```
HEIGHT = Call Stack Depth
   ↑
   │     ┌─────────────────────────────┐
   │     │   Deep function calls       │  (More nested)
   │     ├──────────┬──────────────────┤
   │     │Function 2│  Function 3      │
   │     ├─────────────┬────────────────┤
   │     │ Function 1  │  Function 4    │
   └─────┴─────────────┴────────────────┴──────→
         TIME (CPU Samples)
         WIDTH = How long function took
```

### Step 3: Interact with the Graph

| Action | Result |
|--------|--------|
| **Hover** | See function name & sample count in tooltip |
| **Click on a block** | Zoom in on that function |
| **Double-click** | Reset zoom to full view |
| **Scroll** | Zoom in/out (if implemented) |

### Step 4: Download Your Data
```
Click "⬇️ Download Graph" 
→ Saves flame-graph-TIMESTAMP.json
→ Use for analysis or sharing
```

---

## 🔗 Connect to Your API

### Option 1: Send Data After Profiling (Recommended)

**In your API code:**

```typescript
// apps/api/src/server.ts
import { initProfiler, sendProfileData } from '@/lib/profiler-bridge';

// Initialize the profiler bridge
initProfiler({
  visualizerUrl: 'http://localhost:3001',
  enabled: true,
});

// After running a profiling session:
// 1. Generate data with: npm run profile
// 2. Then send it:

sendProfileData('./isolate-XXXXX.log', 'Production profiling');

// Open http://localhost:3001 to see live graph
```

### Option 2: Continuous Monitoring

```typescript
// In your request handler:
import { startMetric, endMetric } from '@/lib/profiling';

app.post('/api/analyze', async (req, res) => {
  startMetric('analyze-resume');
  
  // ... do analysis ...
  
  const metric = endMetric('analyze-resume');
  console.log(`✓ Analysis took ${metric.duration}ms`);
  
  // Send to visualizer if running
  // The bridge can automatically send telemetry
});
```

---

## 📈 Interpreting Results

### "Hot Spots" (What to Optimize First)

Look for **wide red/pink blocks** - these are your bottlenecks:

```
Wide block = More CPU time spent here
↓
OPTIMIZATION PRIORITY
```

**Example:**
```
❌ BEFORE: analyzeResume takes 70% of time
   ┌────────────────────────────────────────────┐
   │         analyzeResume (3500ms)             │  ← Optimize this
   ├──────┬──────┬──────┬──────┬────────────────┤
   │json  │cache │model │i/o   │other           │
   └──────┴──────┴──────┴──────┴────────────────┘

✅ AFTER: Optimized to 1500ms
   ┌──────────────────┐
   │ analyzeResume    │  ← 60% faster!
   ├──────┬──────┬────┤
   │json  │cache │i/o │
   └──────┴──────┴────┘
```

### What Different Colors Mean

| Color | Meaning | Action |
|-------|---------|--------|
| 🔴 Red/Pink | **Hot path** - high CPU | Optimize first |
| 🟠 Orange | **Active** - normal execution | Monitor |
| 🔵 Blue | **System** - built-in functions | Usually ok |
| 🟢 Green | **I/O** - network/disk | Check latency |
| 🟣 Purple | **Other modules** | Investigate if wide |

---

## 🎯 Performance Targets

```
API Performance Targets:
├─ Resume Analysis       : < 5000ms  (AI model dependent)
├─ History Fetch         : < 500ms
├─ File Upload           : < 2000ms
└─ Profile Generation    : < 3000ms

Frontend Performance:
├─ Page Load             : < 3000ms
├─ Component Render      : < 16.67ms (60fps)
├─ LCP (Largest Paint)   : < 2500ms
├─ FID (Input Delay)     : < 100ms
└─ CLS (Layout Shift)    : < 0.1
```

---

## 🛠️ Advanced Usage

### Profiling Real API Requests

```bash
# Terminal 1: Start profiling
cd apps/api
npm run profile:flame

# Terminal 2: Make requests
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"resume":"...","jd":"..."}'

# Terminal 3: Start visualizer
cd apps/profiler
npm run dev

# Open http://localhost:3001
```

### Load Testing

```bash
# Terminal 1: Start your API
cd apps/api
npm run dev

# Terminal 2: Load testing with profiling
cd apps/api
npx autocannon http://localhost:3000/api/analyze --duration=10

# Terminal 3: Visualizer
cd apps/profiler
npm run dev

# Open http://localhost:3001
```

### Memory Profiling

```bash
# Detect memory leaks
cd apps/api
node --max-old-space-size=4096 --expose-gc src/server.ts

# With visualizer running, make many requests
# Watch for increasing memory usage in flame graphs
```

---

## 📁 File Structure

```
apps/profiler/
├── package.json           ← Dependencies
├── server.mjs             ← Backend Express server
├── README.md              ← Detailed documentation
└── public/
    └── index.html         ← Interactive visualizer UI
    
apps/api/src/lib/
├── profiling.ts           ← Performance tracking utilities
└── profiler-bridge.ts     ← API ↔ Visualizer bridge

Root:
├── start-profiler.bat     ← Windows quick start
├── start-profiler.sh      ← Mac/Linux quick start
└── FLAME_GRAPH_SETUP.md  ← Flame graph reference
```

---

## ✅ Checklist

- [ ] Run `start-profiler.bat` or `start-profiler.sh`
- [ ] Open http://localhost:3001 in browser
- [ ] Click "Generate Mock Data" to see example
- [ ] Explore the interactive graph
- [ ] Download test data (JSON)
- [ ] Set up profiler bridge in your API
- [ ] Run real profiling from your API
- [ ] Send data to visualizer
- [ ] Identify top 3 bottlenecks
- [ ] Implement optimizations
- [ ] Re-profile to verify improvements

---

## 🐛 Troubleshooting

### Port 3001 Already in Use

```bash
# Option 1: Kill the process
lsof -i :3001
kill -9 <PID>

# Option 2: Use different port
PORT=3002 npm run dev
```

### Canvas Not Rendering

Check browser console (F12):
```javascript
// If you see errors, try:
1. Refresh page (Ctrl+R)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check localhost:3001 is correct
```

### Data Not Uploading

```bash
# Verify visualizer is running:
curl http://localhost:3001/api/profile/metadata

# If connection errors, check:
1. Both servers running on correct ports
2. CORS enabled (it is by default)
3. Firewall not blocking localhost
```

---

## 🚀 Next Steps

1. **Profile Your API**
   ```bash
   npm run profile:flame -- src/server.ts
   ```

2. **Identify Bottlenecks**
   - Look for wide red blocks
   - Note function names and depths

3. **Optimize**
   - Cache expensive operations
   - Parallelize I/O
   - Replace slow algorithms

4. **Verify Improvements**
   - Re-profile after changes
   - Compare before/after graphs
   - Document improvements

---

## 📚 Resources

- **Flame Graph Guide**: See `FLAME_GRAPH_SETUP.md`
- **Performance Guide**: See `PERFORMANCE_PROFILING_GUIDE.md`
- **Brendan Gregg's Flame Graphs**: http://www.brendangregg.com/flamegraphs.html
- **Node.js Profiling**: https://nodejs.org/en/docs/guides/profiling/

---

## 🎓 Learning Path

```
1. Generate Mock Data (5 min)
   ↓
2. Understand Color Coding (5 min)
   ↓
3. Hover & Click Around (5 min)
   ↓
4. Download Sample Data (2 min)
   ↓
5. Send Real API Data (10 min)
   ↓
6. Identify 3 Hot Spots (10 min)
   ↓
7. Optimize & Re-profile (30+ min)
   ↓
8. Document Improvements (5 min)
```

---

## 💡 Pro Tips

1. **Always profile with realistic data** - Mock data helps understand UI, real data shows real bottlenecks
2. **Compare multiple runs** - Performance varies, take average
3. **Keep baseline graphs** - Compare against original for progress tracking
4. **Share graphs** - Download JSON and send to team for discussion
5. **Profile different scenarios** - Fast path vs slow path vs error cases

---

## 🔗 Quick Links

- 🌐 **Visualizer**: http://localhost:3001
- 📊 **API Profiling**: http://localhost:3000 (your main API)
- 📚 **Docs**: See `FLAME_GRAPH_SETUP.md`
- 🐛 **Issues**: Check browser console for errors

---

**Welcome to Revivify AI Performance Profiling! 🚀**

Questions? Check the guides or explore the visualizer UI - everything is documented inline!
