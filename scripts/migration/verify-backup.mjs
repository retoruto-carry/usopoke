import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const dir = process.argv[2];
if (!dir) throw new Error('Usage: node scripts/migration/verify-backup.mjs <backup-directory>');
const objects = (await fs.readFile(path.join(dir,'storage-inventory.ndjson'),'utf8')).trim().split('\n').map(JSON.parse);
const saved = new Map(JSON.parse(await fs.readFile(path.join(dir,'verified-checksums.json'),'utf8')).map(row=>[row.id,row]));
const manifest = [];
for (const object of objects) {
  const bytes = await fs.readFile(path.join(dir,'objects',object.id));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== Number(object.metadata.size) || saved.get(object.id)?.sha256 !== sha256) throw new Error(`Backup mismatch: ${object.id}`);
  manifest.push({id:object.id,key:object.name,bytes:bytes.length,sha256});
}
await fs.writeFile(path.join(dir,'verified-checksums.json'),JSON.stringify(manifest,null,2),{mode:0o600});
const report = {objects:manifest.length,bytes:manifest.reduce((n,o)=>n+o.bytes,0),verifiedAt:new Date().toISOString()};
await fs.writeFile(path.join(dir,'backup-verified.json'),JSON.stringify(report,null,2),{mode:0o600});
console.log(report);
