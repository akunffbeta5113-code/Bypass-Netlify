import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async (req) => {
  const u = new URL(req.url);
  const action = u.searchParams.get('action');
  const title = u.searchParams.get('title');
  const content = u.searchParams.get('content');
  const contact = u.searchParams.get('contact');
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');

  if (!action) {
    const t = await kv.get('info_title') || 'Tentang Aplikasi';
    const c = await kv.get('info_content') || 'Bypass Web\n\nVersi 1.0.0\n\n© SECRETDEV';
    const ct = await kv.get('info_contact') || '';
    return new Response(JSON.stringify({ title: t, content: c, contact: ct }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    await kv.set('info_title', title || 'Tentang Aplikasi');
    await kv.set('info_content', content || '');
    await kv.set('info_contact', contact || '');
    return new Response(JSON.stringify({ success: true, message: 'Info disimpan' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Action tidak dikenal' }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  });
};
