// Training Tracker - lightweight local server, no dependencies.
// Run with: node server.js   then open http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'workouts.json');

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { weeks: {} };
  }
}

function saveData(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  // Write to a temp file first so a crash mid-write can't corrupt the log.
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/data' && req.method === 'GET') {
    return sendJSON(res, 200, loadData());
  }

  if (url.pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) req.destroy(); // 10MB cap
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        // Accept both the current date-keyed shape ({days}) and the legacy
        // week-keyed shape ({weeks}) so old data files still round-trip.
        if (!data || typeof data !== 'object' ||
            (typeof data.days !== 'object' && typeof data.weeks !== 'object')) {
          throw new Error('bad shape');
        }
        saveData(data);
        sendJSON(res, 200, { ok: true });
      } catch (err) {
        sendJSON(res, 400, { ok: false, error: String(err.message || err) });
      }
    });
    return;
  }

  // Static files
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.normalize(path.join(PUBLIC_DIR, filePath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
    res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
});

// Bind to localhost only so the tracker isn't exposed on your network.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Training Tracker running at http://localhost:${PORT}`);
  console.log(`Data saved to ${DATA_FILE}`);
});
