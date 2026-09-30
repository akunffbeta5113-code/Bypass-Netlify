import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async (req) => {
  const u = new URL(req.url);
  const action = u.searchParams.get('action');
  const wa = u.searchParams.get('wa');
  const telegram = u.searchParams.get('telegram');
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');

  if (!action) {
    const wa = await kv.get('contact_wa') || '';
    const telegram = await kv.get('contact_telegram') || '';
    return new Response(JSON.stringify({ wa, telegram, active: !!(wa || telegram) }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    await kv.set('contact_wa', wa || '');
    await kv.set('contact_telegram', telegram || '');
    return new Response(JSON.stringify({ success: true, message: 'Kontak disimpan' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'off') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    await kv.set('contact_wa', '');
    await kv.set('contact_telegram', '');
    return new Response(JSON.stringify({ success: true, message: 'Kontak dihapus' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Action tidak dikenal' }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  });
};
