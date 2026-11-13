import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCardSubmission, MAX_UPLOAD_BYTES } from '../app/services/cardValidation.server.ts';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
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
