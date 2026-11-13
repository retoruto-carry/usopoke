// Legacy Pages URLs remain useful without keeping a Supabase-backed app running.
export default {
  fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'usopoke.asonde.me') {
      return new Response('メンテナンス中です。時間をおいてお試しください。', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
    url.protocol = 'https:';
    url.hostname = 'usopoke.asonde.me';
    url.port = '';
    return Response.redirect(url, request.method === 'GET' || request.method === 'HEAD' ? 301 : 303);
  },
};
