import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async (req) => {
  const u = new URL(req.url);
  const action = u.searchParams.get('action');
  const message = u.searchParams.get('message');
  const type = u.searchParams.get('type');
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');

  if (!action) {
    const message = await kv.get('broadcast_message') || '';
    const type = await kv.get('broadcast_type') || 'info';
    const active = await kv.get('broadcast_active') || 'off';
    return new Response(JSON.stringify({ active: active === 'on', message, type }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    await kv.set('broadcast_message', message || '');
    await kv.set('broadcast_type', type || 'info');
    await kv.set('broadcast_active', 'on');
    return new Response(JSON.stringify({ success: true, message: 'Broadcast terkirim' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'off') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    await kv.set('broadcast_active', 'off');
    return new Response(JSON.stringify({ success: true, message: 'Broadcast dimatikan' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Action tidak dikenal' }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  });
};
