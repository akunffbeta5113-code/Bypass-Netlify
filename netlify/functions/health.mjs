import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

async function cekSemuaServer() {
  const results = {
    vercel: { status: 'online', time: 1, message: 'API berjalan normal' },
    upstash: { status: 'checking', time: 0, message: '' },
    theresav: { status: 'checking', time: 0, message: '' }
  };

  const kvStart = Date.now();
  try {
    const val = await kv.get('health_heartbeat');
    results.upstash.status = 'online';
    results.upstash.time = Date.now() - kvStart;
    results.upstash.message = 'Upstash KV berjalan normal';
  } catch (err) {
    results.upstash.status = 'offline';
    results.upstash.time = Date.now() - kvStart;
    results.upstash.message = 'Error: ' + err.message;
  }

  const tStart = Date.now();
  try {
    const response = await fetch('https://api.theresav.eu/api/bypass/move2link?url=https://move2link.co/b4264b4', {
      headers: { 'x-apikey': 'SQ7Dw' }
    });
    const elapsed = Date.now() - tStart;
    if (response.ok) {
      const data = await response.json();
      results.theresav.status = data.status === true ? 'online' : 'warning';
      results.theresav.message = data.status === true ? 'Theresav berjalan normal' : 'Respons tidak valid';
    } else {
      results.theresav.status = 'warning';
      results.theresav.message = 'HTTP ' + response.status;
    }
    results.theresav.time = elapsed;
  } catch (err) {
    results.theresav.status = 'offline';
    results.theresav.time = Date.now() - tStart;
    results.theresav.message = 'Error: ' + err.message;
  }

  return results;
}

export default async (req) => {
  const u = new URL(req.url);
  const key1 = u.searchParams.get('key1');
  const key2 = u.searchParams.get('key2');
  const auto = u.searchParams.get('auto');

  if (auto === '1') {
    const results = await cekSemuaServer();
    return new Response(JSON.stringify({ auto: true, results }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  const results = await cekSemuaServer();
  return new Response(JSON.stringify({ auto: false, results }), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  });
};
