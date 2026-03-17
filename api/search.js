// api/search.js
import { kv } from '@vercel/kv';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query, location } = req.query;
  if (!query) return res.status(400).json({ error: 'query required' });

  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) return res.status(500).json({ error: 'SERPAPI_KEY not set in Vercel environment variables' });

  try {
    const searchQuery = `${query} ${location || 'Northern Ireland'}`;
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&type=search&api_key=${serpApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return res.status(400).json({ error: data.error });

    const results = (data.local_results || []).map(r => ({
      business_name: r.title || '',
      address: r.address || '',
      town: extractTown(r.address || ''),
      phone: r.phone || '',
      website: r.website || '',
      has_website: !!(r.website),
      google_url: r.link || '',
      rating: r.rating ? String(r.rating) : '',
      reviews: r.reviews ? String(r.reviews) : '',
      category: r.type || '',
      stage: 'new',
      notes: '',
      contact_name: '',
      contact_method: '',
      facebook: '',
      instagram: '',
      last_contact: '',
      search_query: searchQuery,
    }));

    // Save new leads to KV — skip duplicates (same business_name + address)
    let saved = 0;
    for (const lead of results) {
      const dupKey = `dedup:${lead.business_name.toLowerCase().replace(/\s+/g,'')}:${lead.address.toLowerCase().replace(/\s+/g,'')}`;
      const exists = await kv.get(dupKey);
      if (!exists) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const full = { ...lead, id, created_at: new Date().toISOString() };
        await kv.hset(`lead:${id}`, full);
        await kv.lpush('lead_ids', id);
        await kv.set(dupKey, id);
        saved++;
      }
    }

    return res.status(200).json({ results, saved, total: results.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function extractTown(address) {
  if (!address) return '';
  const parts = address.split(',').map(s => s.trim());
  const niTowns = ['Belfast','Derry','Londonderry','Coleraine','Ballymena','Antrim','Newry','Armagh','Omagh','Enniskillen','Lisburn','Bangor','Newtownabbey','Carrickfergus','Ballymoney','Limavady','Portstewart','Portrush','Ballycastle','Larne','Cookstown','Dungannon','Strabane','Magherafelt'];
  for (const part of parts) {
    if (niTowns.some(t => part.includes(t))) return part;
  }
  return parts[Math.max(0, parts.length - 2)] || '';
}
