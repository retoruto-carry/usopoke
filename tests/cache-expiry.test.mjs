import test from 'node:test';
import assert from 'node:assert/strict';
import { conditionalImageResponse } from '../app/services/http.server.ts';
function cached(expires) {
 return new Response('image',{headers:{'Cache-Control':'public, max-age=1209600, immutable',Expires:expires,ETag:'"test"',Age:'1209590'}});
}
test('cache hits and 304 never renew a non-gallery image past absolute expiry',()=>{
 const expires = new Date(Date.now()+10000).toUTCString();
 for(const conditional of [false,true]){
  const request=new Request('https://usopoke.asonde.me/card-images/public%2Ftest',{headers:conditional?{'If-None-Match':'W/"test"'}:{}});
  const response=conditionalImageResponse(request,cached(expires));
  assert.equal(response.status,conditional?304:200);
  const maxAge=Number(response.headers.get('Cache-Control').match(/max-age=(\d+)/)[1]);
  assert.ok(maxAge<=10 && maxAge>=0);assert.equal(response.headers.get('Expires'),expires);assert.equal(response.headers.get('Age'),null);
 }
});
test('expired cached images return 404 even with matching validators',()=>{
 const request=new Request('https://usopoke.asonde.me/card-images/public%2Ftest',{headers:{'If-None-Match':'"test"'}});
 assert.equal(conditionalImageResponse(request,cached(new Date(Date.now()-1000).toUTCString())).status,404);
});
