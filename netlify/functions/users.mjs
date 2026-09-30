// netlify/functions/users.mjs
// Log user terakhir yang masuk

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async (req) => {
  const u = new URL(req.url);
  const action = u.searchParams.get('action');
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  };

  // ==========================================
  // MODE LOG — user kirim data saat buka
  // ==========================================
  if (action === 'log') {
    try {
      const device = u.searchParams.get('device') || 'unknown';
      const ua = req.headers.get('user-agent') || '';
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
              || req.headers.get('x-real-ip')
              || 'unknown';

      const userData = {
        time: new Date().toISOString(),
        ip: ip,
        device: device,
        ua: ua.substring(0, 200)
      };

      await redis.lpush('user_logs', JSON.stringify(userData));
      await redis.ltrim('user_logs', 0, 49);  // max 50

      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers });
    }
  }

  // ==========================================
  // MODE GET — admin minta daftar user
  // ==========================================
  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers });
  }

  try {
    const rawLogs = await redis.lrange('user_logs', 0, 49) || [];
    const logs = [];
    for (const raw of rawLogs) {
      try {
        logs.push(typeof raw === 'string' ? JSON.parse(raw) : raw);
      } catch (e) {}
    }

    // Hitung unique IP
    const uniqueIPs = new Set(logs.map(l => l.ip));
    const uniqueDevices = new Set(logs.map(l => l.device));

    return new Response(JSON.stringify({
      total: logs.length,
      uniqueIPs: uniqueIPs.size,
      uniqueDevices: uniqueDevices.size,
      logs: logs
    }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, logs: [] }), { status: 500, headers });
  }
};
