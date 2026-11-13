import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { cardImageKeyFromPath, createR2ImageStore } from "../app/repositories/r2ImageStore.server.ts";
import { deleteExpiredCards } from "../app/services/retention.server.ts";

const resolver = registerHooks({
  resolve(specifier, context, nextResolve) {
    // Match Vite's extensionless server module resolution while loading the repository.
    return nextResolve(specifier.endsWith(".server") ? `${specifier}.ts` : specifier, context);
  },
});
const { createD1CardRepository } = await import("../app/repositories/d1CardRepository.server.ts");
resolver.deregister();

const cardData = {
  name: "画像",
  hp: "50",
  move1_name: "one",
  move1_damage: "10",
  move1_info: "x",
  move2_name: "two",
  move2_damage: "20",
  move2_info: "y",
  twitter_username: "test",
  show_in_gallery: false,
};

test("D1 and R2 retain gallery cards and remove expired non-gallery cards in batches", async (t) => {
  const runtime = new Miniflare(convertV4MiniflareOptions({
    script: "export default {}",
    modules: true,
    compatibilityDate: "2026-10-01",
    d1Databases: { DB: "db" },
    r2Buckets: { IMAGES: "images" },
  }));
  t.after(() => runtime.dispose());

  const db = await runtime.getD1Database("DB");
  const bucket = await runtime.getR2Bucket("IMAGES");
  const migration = await readFile(new URL("../migrations/0001_cards.sql", import.meta.url), "utf8");
  // Split only top-level statements to keep the gallery trigger body together.
  const statements = migration.split(/;(?=\s*(?:CREATE|--|$))/u).filter((sql) => sql.trim());
  await db.batch(statements.map((sql) => db.prepare(sql)));

  const cards = createD1CardRepository(db);
  const images = createR2ImageStore(bucket);
  const image = new File([Uint8Array.of(137, 80, 78, 71)], "card.png", { type: "image/png" });
  assert.equal(await cards.getRandomCard(), null);

  const privateCard = await cards.insertCard({ ...cardData, image_url: await images.uploadCardImage(image) });
  const galleryCard = await cards.insertCard({
    ...cardData,
    image_url: await images.uploadCardImage(image),
    show_in_gallery: true,
  });
  const privateKey = cardImageKeyFromPath(privateCard.image_url);
  assert.match(privateKey, /^public\/[0-9a-f-]{36}\.png$/);
  assert.equal(cardImageKeyFromPath("/card-images/public%2F..%2Fsecret"), null);
  assert.equal((await bucket.head(privateKey)).httpMetadata.contentType, "image/png");
  assert.deepEqual(await cards.getCard(privateCard.id), privateCard);
  assert.deepEqual(await cards.getRandomCard(), galleryCard);
  assert.equal(
    (await cards.getCardWithExpiry(privateCard.id)).expires_at,
    Math.floor(Date.parse(privateCard.created_at) / 1000) + 14 * 86400,
  );

  await db.prepare("UPDATE cards SET expires_at = unixepoch() - 1 WHERE id = ?").bind(privateCard.id).run();
  assert.equal(await cards.getCard(privateCard.id), null);
  assert.equal(await cards.getCardImageExpiry(privateKey), null);
  assert.deepEqual(await cards.getCardImageExpiry(cardImageKeyFromPath(galleryCard.image_url)), { expires_at: null });

  // These expired rows model a scheduled run interrupted between R2 and D1 deletion.
  await db.batch(Array.from({ length: 100 }, (_, index) => db.prepare(`
    INSERT INTO cards (
      id, created_at, image_key, show_in_gallery, name, hp,
      move1_name, move1_damage, move1_info, move2_name, move2_damage, move2_info, expires_at
    ) VALUES (?, '', ?, 0, '', '', '', '', '', '', '', '', unixepoch())
  `).bind(`expired-${index}`, `public/expired-${index}`)));
  assert.equal(await deleteExpiredCards(db, bucket), 100);
  assert.equal(await bucket.head(privateKey), null);
  assert.equal(await deleteExpiredCards(db, bucket), 1);
  assert.equal(await deleteExpiredCards(db, bucket), 0);
  assert.ok(await bucket.head(cardImageKeyFromPath(galleryCard.image_url)));
  assert.deepEqual(await cards.getRandomCard(), galleryCard);
});
