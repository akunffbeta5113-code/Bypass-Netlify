import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async (req) => {
  const u = new URL(req.url);
  const action = u.searchParams.get('action');
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');

  if (!action) {
    const maintenance = (await kv.get('maintenance')) === 'on';
    return new Response(JSON.stringify({ maintenance }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'on' || action === 'off') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    await kv.set('maintenance', action);
    return new Response(JSON.stringify({
      success: true,
      maintenance: action === 'on',
      message: action === 'on' ? 'Maintenance AKTIF' : 'Maintenance NONAKTIF'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (action === 'adminView') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return new Response(JSON.stringify({ isAdmin: false }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ isAdmin: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Action tidak dikenal' }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  });
};
