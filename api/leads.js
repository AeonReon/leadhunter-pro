// api/leads.js
import { Redis } from '@upstash/redis';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const redis = Redis.fromEnv();

  // GET all leads
  if (req.method === 'GET') {
    try {
      const keys = await redis.lrange('lead_ids', 0, -1);
      if (!keys.length) return res.status(200).json([]);
      const leads = await Promise.all(keys.map(k => redis.hgetall(`lead:${k}`)));
      const valid = leads.filter(Boolean).sort((a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      return res.status(200).json(valid);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST new lead
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const lead = { ...body, id, created_at: new Date().toISOString() };
      await redis.hset(`lead:${id}`, lead);
      await redis.lpush('lead_ids', id);
      return res.status(201).json(lead);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // PATCH update lead
  if (req.method === 'PATCH') {
    try {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      updates.updated_at = new Date().toISOString();
      const existing = await redis.hgetall(`lead:${id}`);
      if (!existing) return res.status(404).json({ error: 'not found' });
      const updated = { ...existing, ...updates };
      await redis.hset(`lead:${id}`, updated);
      return res.status(200).json(updated);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // DELETE
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await redis.del(`lead:${id}`);
      await redis.lrem('lead_ids', 0, id);
      return res.status(200).json({ deleted: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'method not allowed' });
}
