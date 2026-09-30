// netlify/functions/users.mjs
// Log user terakhir yang masuk — kalau IP sama, update waktu saja

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

      // ==========================================
      // Ambil semua log yang ada
      // ==========================================
      const rawLogs = await redis.lrange('user_logs', 0, -1) || [];
      let logs = [];
      for (const raw of rawLogs) {
        try {
          logs.push(typeof raw === 'string' ? JSON.parse(raw) : raw);
        } catch (e) {}
      }

      // ==========================================
      // Cek apakah IP sudah ada
      // ==========================================
      const existingIdx = logs.findIndex(l => l.ip === ip);

      if (existingIdx !== -1) {
        // IP sudah ada → update waktu + device
        logs[existingIdx].time = new Date().toISOString();
        logs[existingIdx].device = device;
        logs[existingIdx].ua = ua.substring(0, 200);
        logs[existingIdx].visits = (logs[existingIdx].visits || 1) + 1;
      } else {
        // IP baru → tambah di paling atas
        logs.unshift({
          time: new Date().toISOString(),
          ip: ip,
          device: device,
          ua: ua.substring(0, 200),
          visits: 1
        });
      }

      // Batasi max 50
      logs = logs.slice(0, 50);

      // ==========================================
      // Simpan kembali — hapus list lama, tulis ulang
      // ==========================================
      await redis.del('user_logs');
      if (logs.length > 0) {
        // lpush pakai array (bulk)
        await redis.lpush('user_logs', ...logs.map(l => JSON.stringify(l)));
        await redis.ltrim('user_logs', 0, 49);
      }

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