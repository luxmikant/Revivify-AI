# Standalone Flame Graph Visualizer

Interactive, real-time flame graph viewer for Revivify AI performance profiling.

## 🚀 Quick Start

```bash
cd apps/profiler
npm install
npm run dev
```

Then open **http://localhost:3001** in your browser.

## ✨ Features

- **Interactive Visualization**: Click to zoom, double-click to reset
- **Real-time Data**: Load profiling data from your running API
- **Color-coded Functions**: Visual hierarchy of performance bottlenecks
- **Tooltips**: Hover to see function names and sample counts
- **Mock Data**: Generate test data to explore the interface
- **Statistics**: View total samples, graph nodes, duration, zoom level
- **Download**: Export graph data as JSON for analysis

## 📊 How to Use

### 1. **Generate Mock Data** (for testing)
```
Click "Generate Mock Data" to see a sample flame graph
```

### 2. **Understanding the Graph**
- **X-axis**: CPU Time (width = time spent in function)
- **Y-axis**: Call Stack Depth (height = nesting level)
- **Colors**: Different functions and modules
- **Wide blocks**: Hot spots (high CPU usage)

### 3. **Navigate the Graph**
- **Hover**: See function details in tooltip
- **Click**: Zoom into selected region
- **Double-click**: Reset view to full graph
- **Drag**: Pan across the graph (if implemented)

## 🔗 Integration with Your API

To send real profiling data from your API:

```javascript
// In your API server (Node.js)
const isolateLog = fs.readFileSync('isolate-*.log', 'utf-8');

fetch('http://localhost:3001/api/profile/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    isolateLog: isolateLog,
    timestamp: Date.now(),
  }),
});
```

## 📈 Performance Interpretation

### Why Look at Flame Graphs?

1. **Identify Bottlenecks**: See which functions consume most CPU
2. **Call Stack Analysis**: Understand how functions call each other
3. **Optimization Targets**: Focus on wide blocks with highest value
4. **Memory Issues**: Detect GC pauses and memory pressure

### What to Look For

```
✓ Wide blocks = Hot spots (optimize first)
✓ Tall stacks = Deep call chains (may indicate overhead)
✓ Colorful variety = Different modules being used
✗ Many small blocks = Fragmented execution
✗ Flat profile = Single bottleneck
```

## 🛠️ Customization

### Add More Functions to Mock Data

Edit `server.mjs`:

```javascript
const functions = [
  'main',
  'express',
  'yourFunction', // Add here
  'anotherFunction',
];
```

### Change Colors

Edit `public/index.html`:

```javascript
const colors = [
  '#ff6b9d',  // Primary
  '#ffa500',  // Secondary
  '#3b82f6',  // Add more
];
```

### Adjust Block Size

In `public/index.html`:

```javascript
const blockHeight = 20; // Increase for taller blocks
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serve the visualization page |
| `/api/profile/graph` | GET | Get current flame graph data |
| `/api/profile/metadata` | GET | Get profiling metadata |
| `/api/profile/data` | POST | Upload profiling data |
| `/api/profile/generate-mock` | POST | Generate test data |
| `/api/profile/reset` | POST | Clear all data |

## 🔍 Troubleshooting

### Port 3001 already in use
```bash
# Use a different port
PORT=3002 npm run dev
```

### Canvas not rendering
Check browser console for errors:
```
F12 → Console tab → Look for red errors
```

### Color Coding not visible
Adjust canvas styling in `public/index.html`:
```javascript
ctx.fillStyle = 'rgba(255, 107, 157, 0.8)'; // More opaque
```

## 📚 Learn More

- [Flame Graphs Guide](../FLAME_GRAPH_SETUP.md)
- [Performance Profiling Guide](../PERFORMANCE_PROFILING_GUIDE.md)
- [0x - Flame Graph Generator](https://github.com/davidmarkclements/0x)
- [Brendan Gregg's Flame Graphs](http://www.brendangregg.com/flamegraphs.html)

## 🎨 Color Legend

- **Red/Pink** (#ff6b9d): Hot functions (high CPU)
- **Orange** (#ffa500): Active functions
- **Blue** (#3b82f6): System functions
- **Green** (#10b981): I/O operations
- **Purple** (#8b5cf6): Other modules
- **Yellow** (#f59e0b): Utilities
- **Cyan** (#06b6d4): Advanced features
- **Magenta** (#ec4899): Edge cases

---

**Built with ❤️ for Revivify AI**
