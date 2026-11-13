import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
// Input is a verified local snapshot; the original rows remain untouched for recovery.
const directory = process.argv[2];
if (!directory) throw new Error('Usage: node scripts/migration/prepare-data.mjs <backup-directory>');
const cards = JSON.parse(await readFile(path.join(directory, 'cards.json'), 'utf8'));
const inventory = (await readFile(path.join(directory, 'storage-inventory.ndjson'), 'utf8')).trim().split('\n').map(JSON.parse);
const names = new Set(inventory.map(object => object.name));
const now = Math.floor(Date.now()/1000);
const retained = [], expired = [];
for (const card of cards) {
  const url = new URL(card.image_url);
  const prefix = '/storage/v1/object/public/card_images/';
  if (url.origin !== 'https://bppgbaxsswwmvfxabgmk.supabase.co' || !url.pathname.startsWith(prefix)) throw new Error(`Unexpected image source for ${card.id}`);
  const image_key = decodeURIComponent(url.pathname.slice(prefix.length));
  if (!names.has(image_key) || !/^public\/[\w-]+(?:\.png)?$/.test(image_key)) throw new Error(`Missing or invalid image key for ${card.id}`);
  const expires_at = card.show_in_gallery ? null : Math.floor(Date.parse(card.created_at)/1000) + 14*86400;
  if (expires_at !== null && expires_at <= now) { expired.push(card.id); continue; }
  const {image_url: _imageUrl, ...rest} = card;
  retained.push({...rest, show_in_gallery:Number(card.show_in_gallery), image_key, expires_at});
}
const columns = ['id','created_at','image_key','show_in_gallery','name','hp','move1_name','move1_damage','move1_info','move2_name','move2_damage','move2_info','twitter_username','expires_at'];
const sqlValue = value => value === null ? 'NULL' : typeof value === 'number' ? String(value) : `'${value.replaceAll("'", "''")}'`;
const sql = retained.map(card => `INSERT INTO cards (${columns.join(',')}) VALUES (${columns.map(column=>sqlValue(card[column])).join(',')}) ON CONFLICT(id) DO NOTHING;`).join('\n');
await writeFile(path.join(directory,'cards-import.sql'),sql+'\n',{mode:0o600});
await writeFile(path.join(directory,'expected-d1.json'),JSON.stringify(retained,null,2),{mode:0o600});
await writeFile(path.join(directory,'expired-card-ids.json'),JSON.stringify(expired,null,2),{mode:0o600});
console.log({source:cards.length,retained:retained.length,expired:expired.length});
