// netlify/functions/bypass.mjs
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const ENDPOINTS = {
  adlink: 'adlink',
  sfl: 'sfl',
  delta: 'izen',
  linkvertise: 'linkvertise',
  move2link: 'move2link',
  sub2unlock: 'sub2unlock',
  sub4unlock: 'sub4unlock',
  universal: 'universal'
};

export default async (req) => {
  const u = new URL(req.url);
  const type = u.searchParams.get('type');
  const url = u.searchParams.get('url');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  };

  if (!type || !url) {
    return new Response(JSON.stringify({ error: 'Parameter type dan url wajib diisi' }), {
      status: 400, headers
    });
  }

  if (!ENDPOINTS[type]) {
    return new Response(JSON.stringify({ error: 'Unsupported type: ' + type }), {
      status: 400, headers
    });
  }

  const target = `https://api.theresav.eu/api/bypass/${ENDPOINTS[type]}?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: { 'x-apikey': 'SQ7Dw' }  // ← API KEY DI SINI
    });

    const data = await response.text();

    // Catat statistik
    try {
      const dataJson = JSON.parse(data);
      if (dataJson && dataJson.status === true) {
        const today = new Date().toISOString().split('T')[0];
        await redis.incr(`stats_bypass_${today}`);
        await redis.incr(`stats_service_${type}_${today}`);
        await redis.incr(`stats_total_bypass`);
        await redis.incr(`stats_total_service_${type}`);
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (ip !== 'unknown') await redis.sadd(`stats_users_${today}`, ip);
      }
    } catch (e) {}

    return new Response(data, {
      status: response.status,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers
    });
  }
};