export function notFound() {
  return new Response('見つかりませんでした。', {status:404,headers:{'Cache-Control':'no-store'}});
}

export async function enforceRateLimit(request: Request, limiter: RateLimit, scope: string) {
  // Cloudflare overwrites this header at the edge; never trust X-Forwarded-For.
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const {success} = await limiter.limit({key:`${scope}:${ip}`});
  if (!success) throw new Response('アクセスが集中しています。少し待ってからお試しください。', {
    status:429, headers:{'Retry-After':'60','Cache-Control':'no-store'},
  });
}

export function cacheHeaders(expiresAt: number | null): Headers {
  const maxAge = expiresAt === null ? 31536000 : Math.max(0, Math.floor(expiresAt - Date.now()/1000));
  const headers = new Headers({
    'Cache-Control':`public, max-age=${maxAge}, immutable`,
    'X-Content-Type-Options':'nosniff',
  });
  if (expiresAt !== null) headers.set('Expires', new Date(expiresAt * 1000).toUTCString());
  return headers;
}

export function canonicalCacheRequest(request: Request, pathname: string): Request {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = '';
  return new Request(url, {method:'GET'});
}

export function conditionalImageResponse(request: Request, response: Response): Response {
  const expires = response.headers.get("Expires");
  if (expires && Date.parse(expires) <= Date.now()) return notFound();

  // A cache hit or 304 must not restart the original non-gallery retention TTL.
  if (expires) {
    response = new Response(response.body, response);
    const remaining = Math.max(0, Math.floor((Date.parse(expires) - Date.now()) / 1000));
    response.headers.set('Cache-Control', `public, max-age=${remaining}, immutable`);
    response.headers.set('Date', new Date().toUTCString());
    response.headers.delete('Age');
  }
  const tag = response.headers.get('ETag');
  const condition = request.headers.get('If-None-Match');
  if (tag && condition?.split(',').some(value=> value.trim()==='*' || value.trim().replace(/^W\//,'')===tag)) {
    return new Response(null,{status:304,headers:response.headers});
  }
  return request.method === 'HEAD' ? new Response(null,{status:response.status,headers:response.headers}) : response;
}

export function isCardId(id: string): boolean {
  return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id);
}

export function defaultCache() {
  return (caches as CacheStorage & { readonly default: Cache }).default;
}

export function storeImageResponse(ctx: ExecutionContext, key: Request, response: Response) {
  ctx.waitUntil(defaultCache().put(key, response.clone()).catch((error) => {
    console.warn({ event: "card_cache_write_failed", error });
  }));
}
