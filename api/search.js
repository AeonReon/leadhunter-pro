// Vercel serverless function — proxies search requests to SerpAPI / HasData
// so the browser never hits CORS issues.

export default async function handler(req, res) {
  // CORS headers (needed for local dev + preflight)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { provider, ...params } = req.query;

  try {
    if (provider === 'hasdata') {
      // ── HasData (POST) ──
      const apiKey = req.headers['x-api-key'] || process.env.HASDATA_KEY || '';
      const upstream = await fetch('https://api.hasdata.com/scrape/google-maps/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(req.body),
      });
      const data = await upstream.json();
      return res.status(upstream.status).json(data);

    } else {
      // ── SerpAPI (GET) ──
      // Use env var as fallback if no api_key in params
      if (!params.api_key && process.env.SERPAPI_KEY) {
        params.api_key = process.env.SERPAPI_KEY;
      }
      const url = `https://serpapi.com/search.json?${new URLSearchParams(params)}`;
      const upstream = await fetch(url);
      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    }

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
