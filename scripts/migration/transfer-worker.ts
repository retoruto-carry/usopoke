// Temporary, authenticated migration endpoint. Remove the Worker after reconciliation.
interface TransferEnv { DB: D1Database; IMAGES: R2Bucket; TRANSFER_TOKEN: string }
const hex = (value?: ArrayBuffer) => value ? Array.from(new Uint8Array(value), b => b.toString(16).padStart(2, '0')).join('') : null;
export default {
  async fetch(request: Request, env: TransferEnv): Promise<Response> {
    if (!env.TRANSFER_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.TRANSFER_TOKEN}`) return new Response(null, { status: 404 });
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/inventory') {
      const result = await env.IMAGES.list({limit:1000,cursor:url.searchParams.get('cursor') || undefined});
      return Response.json({objects:result.objects.map(o=>({key:o.key,size:o.size,sha256:hex(o.checksums.sha256)})),cursor:result.truncated?result.cursor:null});
    }
    if (url.pathname === '/cards' && request.method === 'GET') {
      const rows = await env.DB.prepare('SELECT * FROM cards WHERE id > ? ORDER BY id LIMIT 500').bind(url.searchParams.get('after') || '').all();
      return Response.json(rows.results);
    }
    if (url.pathname === '/cards' && request.method === 'POST') {
      const rows = await request.json() as Record<string, string | number | null>[];
      if (!Array.isArray(rows) || rows.length > 100) return new Response(null, {status:400});
      const columns = ['id','created_at','image_key','show_in_gallery','name','hp','move1_name','move1_damage','move1_info','move2_name','move2_damage','move2_info','twitter_username','expires_at'];
      const statements = rows.map(row => env.DB.prepare(`INSERT INTO cards (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')}) ON CONFLICT(id) DO NOTHING`).bind(...columns.map(c=>row[c])));
      const result = await env.DB.batch(statements);
      return Response.json({changed:result.reduce((n,r)=>n+r.meta.changes,0)});
    }
    const key = decodeURIComponent(url.pathname.slice(1));
    if (!key || key.includes('..') || !key.startsWith('public/')) return new Response(null,{status:400});
    if (request.method === 'GET') {
      const obj=await env.IMAGES.head(key);
      return obj?Response.json({key:obj.key,size:obj.size,sha256:hex(obj.checksums.sha256)}):new Response(null,{status:404});
    }
    if (request.method !== 'PUT' && request.method !== 'POST') return new Response(null,{status:405});
    const sha256=request.headers.get('X-Content-SHA256');
    if (!sha256 || !/^[a-f0-9]{64}$/.test(sha256) || Number(request.headers.get('Content-Length')) > 52428800) return new Response(null,{status:400});
    let body = request.body;
    if (request.method === 'POST') {
      const source = await fetch('https://bppgbaxsswwmvfxabgmk.supabase.co/storage/v1/object/public/card_images/' + key.split('/').map(encodeURIComponent).join('/'));
      if (!source.ok) return new Response(null, {status:502});
      body = source.body;
    }
    const obj=await env.IMAGES.put(key,body,{sha256,httpMetadata:{contentType:request.headers.get('Content-Type') || 'application/octet-stream',cacheControl:'public, max-age=31536000, immutable'}});
    return Response.json({key:obj.key,size:obj.size,sha256:hex(obj.checksums.sha256)});
  }
} satisfies ExportedHandler<TransferEnv>;
