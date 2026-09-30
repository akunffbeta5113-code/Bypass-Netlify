import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';
const ALL_SERVICES = ['adlink', 'sfl', 'delta', 'linkvertise', 'move2link', 'sub2unlock', 'sub4unlock', 'universal'];

export default async (req) => {
  const u = new URL(req.url);
  const action = u.searchParams.get('action');
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');

  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'on') {
    for (const s of ALL_SERVICES) {
      await kv.set(`service_${s}_status`, 'off');
      await kv.set(`service_${s}_reason`, 'Server down sementara');
    }
    await kv.set('maintenance', 'on');
    await kv.set('broadcast_message', '🚨 Server down sementara. Mohon tunggu.');
    await kv.set('broadcast_type', 'danger');
    await kv.set('broadcast_active', 'on');
    return new Response(JSON.stringify({ success: true, message: 'PANIC MODE AKTIF' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'off') {
    for (const s of ALL_SERVICES) {
      await kv.set(`service_${s}_status`, 'on');
      await kv.set(`service_${s}_reason`, '');
    }
    await kv.set('maintenance', 'off');
    await kv.set('broadcast_active', 'off');
    return new Response(JSON.stringify({ success: true, message: 'PANIC MODE NONAKTIF' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Action harus on atau off' }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  });
};
