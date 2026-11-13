import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32, createDeflate, deflateSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
const resolver = registerHooks({
 resolve(specifier, context, nextResolve) {
   return nextResolve(specifier.endsWith('.server') ? `${specifier}.ts` : specifier, context);
 },
});
const { parseCardSubmission, MAX_UPLOAD_BYTES } = await import('../app/services/cardValidation.server.ts');
resolver.deregister();

function chunk(type, data = Buffer.alloc(0)) {
 const length = Buffer.alloc(4);
 length.writeUInt32BE(data.length);
 const payload = Buffer.concat([Buffer.from(type, 'ascii'), data]);
 const crc = Buffer.alloc(4);
 crc.writeUInt32BE(crc32(payload));
 return Buffer.concat([length, payload, crc]);
}

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const header = Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0]);
const scanline = Buffer.from([0, 49, 172, 25, 255]);

function makePng(...chunks) {
 return Buffer.concat([signature, chunk('IHDR', header), ...chunks, chunk('IEND')]);
}

const png = makePng(chunk('IDAT', deflateSync(scanline)));
function request(change = ()=>{}) {
 const form = new FormData();
 for (const key of ['name','hp','move1_name','move1_damage','move1_info','move2_name','move2_damage','move2_info','twitter_username']) form.set(key, '');
 form.set('show_in_gallery','false'); form.set('image',new File([png],'card.png',{type:'image/png'})); change(form);
 return new Request('https://usopoke.asonde.me/',{method:'POST',headers:{origin:'https://usopoke.asonde.me'},body:form});
}
test('accepts valid PNG and explicit opt-out without coercing missing fields',async()=>{
 const parsed=await parseCardSubmission(request(f=>{f.set('name','テスト');f.set('twitter_username','@test_user');}));
 assert.equal(parsed.data.name,'テスト');assert.equal(parsed.data.show_in_gallery,false);assert.equal(parsed.data.twitter_username,'test_user');
});
test('rejects cross-origin submissions',async()=>{const r=request();r.headers.set('origin','https://example.com');await assert.rejects(parseCardSubmission(r),e=>e.status===403);});
test('rejects forged MIME and oversized dimensions',async()=>{
 await assert.rejects(parseCardSubmission(request(f=>f.set('image',new File(['not PNG'.repeat(20)],'x.png',{type:'image/png'})))),e=>e.status===400);
 const huge=Buffer.from(png);huge.writeUInt32BE(99999,16);await assert.rejects(parseCardSubmission(request(f=>f.set('image',new File([huge],'x.png',{type:'image/png'})))),e=>e.status===400);
});
test('rejects duplicate fields and invalid gallery flags',async()=>{
 await assert.rejects(parseCardSubmission(request(f=>f.append('name','duplicate'))),e=>e.status===400);
 await assert.rejects(parseCardSubmission(request(f=>f.set('show_in_gallery','yes'))),e=>e.status===400);
});
test('enforces stream cap without Content-Length',async()=>{
 const r=new Request('https://usopoke.asonde.me/',{method:'POST',headers:{origin:'https://usopoke.asonde.me','content-type':'multipart/form-data; boundary=x'},body:new Uint8Array(MAX_UPLOAD_BYTES+65537)});
 await assert.rejects(parseCardSubmission(r),e=>e.status===413);
});


test('rejects PNGs without image data or with corrupted chunk checksums', async () => {
 const missingImageData = makePng(chunk('gAMA', Buffer.from([0, 0, 177, 143])));
 const wrongChecksum = Buffer.from(png);
 wrongChecksum[wrongChecksum.length - 13] ^= 1;
 for (const badPng of [missingImageData, wrongChecksum]) {
   const input = request(f => f.set('image', new File([badPng], 'x.png', { type: 'image/png' })));
   await assert.rejects(parseCardSubmission(input), e => e.status === 400);
 }
});

test('rejects invalid compression, excess output and unknown scanline filters', async () => {
 const wrongFilter = Buffer.from(scanline);
 wrongFilter[0] = 5;
 for (const compressed of [Buffer.from('not a deflate stream'), deflateSync(Buffer.alloc(1 << 18)), deflateSync(wrongFilter)]) {
   const input = request(f => f.set('image', new File([makePng(chunk('IDAT', compressed))], 'x.png', { type: 'image/png' })));
   await assert.rejects(parseCardSubmission(input), e => e.status === 400);
 }
});

test('strips ancillary decoder metadata and rejects noncontiguous image data', async () => {
 const exif = chunk('eXIf', Buffer.from([73, 73, 42, 0]));
 const imageData = deflateSync(scanline);
 const invalidColorIntent = chunk('sRGB', Buffer.of(255));
 const validWithExif = makePng(exif, invalidColorIntent, chunk('IDAT', imageData));
 const parsed = await parseCardSubmission(request(f => f.set('image', new File([validWithExif], 'x.png', { type: 'image/png' }))));
 assert.deepEqual(Buffer.from(await parsed.image.arrayBuffer()), png);

 const splitImageData = makePng(chunk('IDAT', imageData.subarray(0, 2)), exif, chunk('IDAT', imageData.subarray(2)));
 const input = request(f => f.set('image', new File([splitImageData], 'x.png', { type: 'image/png' })));
 await assert.rejects(parseCardSubmission(input), e => e.status === 400);
});

test('workerd rejects a large expansion before exhausting Worker memory', async (t) => {
 const source = await readFile(new URL('../app/services/cardPng.server.ts', import.meta.url), 'utf8');
 const script = `${stripTypeScriptTypes(source)}
   export default {
     async fetch(request) {
       const image = new File([await request.arrayBuffer()], 'card.png', { type: 'image/png' });
       return new Response(null, { status: await validateCardPng(image) ? 204 : 400 });
     }
   };
 `;
 const runtime = new Miniflare(convertV4MiniflareOptions({
   script,
   modules: true,
   compatibilityDate: '2026-11-13',
   compatibilityFlags: ['nodejs_compat'],
 }));
 t.after(() => runtime.dispose());

 const check = (body) => runtime.dispatchFetch('https://example.com/', { method: 'POST', body });
 // The tiny image declares one pixel, but its compressed data expands beyond 128 MiB.
 const zeroBlock = Buffer.alloc(1024 * 1024);
 const output = Readable.from(Array(130).fill(zeroBlock)).pipe(createDeflate());
 const oversized = makePng(chunk('IDAT', Buffer.concat(await output.toArray())));
 assert.equal((await check(oversized)).status, 400);
 assert.equal((await check(png)).status, 204);
});
