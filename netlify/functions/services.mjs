import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

const VALID_SERVICES = ['adlink', 'sfl', 'delta', 'linkvertise', 'move2link', 'sub2unlock', 'sub4unlock', 'universal'];

export default async (req) => {
  const u = new URL(req.url);
  const action = u.searchParams.get('action');
  const service = u.searchParams.get('service');
  const status = u.searchParams.get('status');
  const reason = u.searchParams.get('reason');
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');

  if (!action) {
    const result = {};
    for (const s of VALID_SERVICES) {
      const st = await kv.get(`service_${s}_status`) || 'on';
      const rs = await kv.get(`service_${s}_reason`) || '';
      result[s] = { status: st, reason: rs };
    }
    return new Response(JSON.stringify({ services: result }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!VALID_SERVICES.includes(service)) {
      return new Response(JSON.stringify({ error: 'Service tidak valid' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    await kv.set(`service_${service}_status`, status);
    await kv.set(`service_${service}_reason`, reason || '');
    return new Response(JSON.stringify({ success: true, service, status, reason: reason || '' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Action tidak dikenal' }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  });
};
