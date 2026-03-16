// Local development server for LeadHunter Pro
// Serves static files + proxies API calls to SerpAPI/HasData
// Usage: node server.js   (then open http://localhost:8080)

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ── API Proxy ──
  if (url.pathname === '/api/search') {
    res.setHeader('Content-Type', 'application/json');
    const provider = url.searchParams.get('provider');

    try {
      if (provider === 'hasdata') {
        // Read POST body
        let body = '';
        for await (const chunk of req) body += chunk;
        const apiKey = req.headers['x-api-key'] || '';

        const upstream = await fetch('https://api.hasdata.com/scrape/google-maps/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
          body: body,
        });
        const data = await upstream.text();
        res.writeHead(upstream.status);
        res.end(data);

      } else {
        // SerpAPI — forward all query params except 'provider'
        url.searchParams.delete('provider');
        const serpUrl = `https://serpapi.com/search.json?${url.searchParams}`;
        const upstream = await fetch(serpUrl);
        const data = await upstream.text();
        res.writeHead(upstream.status);
        res.end(data);
      }
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Static Files ──
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(__dirname, filePath);

  try {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }

}).listen(PORT, () => {
  console.log(`\n  🔥 LeadHunter Pro running at http://localhost:${PORT}\n`);
});
