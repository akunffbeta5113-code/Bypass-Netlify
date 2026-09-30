import { kv } from '@vercel/kv';

export default async (req) => {
  const u = new URL(req.url);
  const action = u.searchParams.get('action');
  const session = u.searchParams.get('session');

  if (action === 'ping') {
    if (session) {
      try { await kv.hset('live_sessions', { [session]: Date.now() }); } catch (e) {}
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  const now = Date.now();
  const timeout = 60 * 1000;

  let liveCount = 1;
  try {
    const expired = [];
for (const key in sessions) {
  if (now - parseInt(sessions[key]) < timeout) {
    active++;
  } else {
    expired.push(key);  // ← kumpulkan yang expired
  }
}
// Hapus session expired
for (const key of expired) {
  await redis.hdel('live_sessions', key);  // ← BERSIHKAN
}
    liveCount = Math.max(active, 1);
  } catch (e) {}

  const today = new Date().toISOString().split('T')[0];
  let todayCount = 0, totalCount = 0;
  try {
    todayCount = parseInt(await kv.get(`stats_bypass_${today}`)) || 0;
    totalCount = parseInt(await kv.get('stats_total_bypass')) || 0;
  } catch (e) {}

  return new Response(JSON.stringify({
    live: liveCount, today: todayCount, total: totalCount
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
