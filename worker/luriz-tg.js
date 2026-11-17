// Посредник LURIZ → Telegram (Cloudflare Worker).
// Планшет отправляет сообщение сюда, а Worker пересылает его в Telegram.
// Пропускаются только два бота салона.
const ALLOWED_BOTS = ['9149259169', '9098853106'];
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/bot(\d+):[^/]+\/(sendMessage|getUpdates|getMe)$/);
    if (!m) return new Response('LURIZ: посредник работает', { headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' } });
    if (!ALLOWED_BOTS.includes(m[1])) return new Response('Forbidden', { status: 403, headers: CORS });
    const init = { method: request.method };
    if (request.method === 'POST') {
      init.body = await request.arrayBuffer();
      init.headers = { 'Content-Type': request.headers.get('Content-Type') || 'application/x-www-form-urlencoded' };
    }
    const r = await fetch('https://api.telegram.org' + url.pathname + url.search, init);
    return new Response(r.body, { status: r.status, headers: { ...CORS, 'Content-Type': 'application/json' } });
  },
};
