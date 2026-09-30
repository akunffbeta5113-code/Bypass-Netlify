export default async (req) => {
  try {
    const base = 'https://' + (req.headers.get('host') || 'bypass-proxy.netlify.app');
    const res = await fetch(base + '/api/health?auto=1');
    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};
