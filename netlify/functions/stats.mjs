import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';
const SERVICES = ['adlink', 'sfl', 'delta', 'linkvertise', 'move2link', 'sub2unlock', 'sub4unlock', 'universal'];

export default async (req) => {
  const u = new URL(req.url);
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');

  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const todayTotal = await kv.get(`stats_bypass_${today}`) || 0;
  const todayUsers = await kv.scard(`stats_users_${today}`) || 0;

  const todayByService = {};
  for (const s of SERVICES) todayByService[s] = await kv.get(`stats_service_${s}_${today}`) || 0;

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = await kv.get(`stats_bypass_${dateStr}`) || 0;
    const users = await kv.scard(`stats_users_${dateStr}`) || 0;
    last7.push({ date: dateStr, count: parseInt(count), users: parseInt(users) });
  }

  const totalAll = await kv.get('stats_total_bypass') || 0;
  const totalByService = {};
  for (const s of SERVICES) totalByService[s] = await kv.get(`stats_total_service_${s}`) || 0;

  let topService = '-', topCount = 0;
  for (const s of SERVICES) {
    const c = parseInt(totalByService[s]) || 0;
    if (c > topCount) { topCount = c; topService = s; }
  }

  return new Response(JSON.stringify({
    today: { total: parseInt(todayTotal), users: parseInt(todayUsers), byService: todayByService },
    last7Days: last7,
    allTime: { total: parseInt(totalAll), byService: totalByService, topService, topCount }
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
