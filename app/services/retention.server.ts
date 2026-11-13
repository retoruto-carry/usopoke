type ExpiredCard = {
  id: string;
  image_key: string;
  expires_at: number;
};

export async function deleteExpiredCards(
  db: D1Database,
  bucket: R2Bucket,
  now = Date.now(),
): Promise<number> {
  const cutoff = Math.floor(now / 1000);
  const { results } = await db.prepare(`
    SELECT id, image_key, expires_at FROM cards
    WHERE expires_at <= ? AND show_in_gallery = 0
    ORDER BY expires_at
    LIMIT 100
  `).bind(cutoff).all<ExpiredCard>();

  if (results.length === 0) return 0;

  // Deleting a missing R2 key is safe, so a retry can finish after a failed D1 write.
  await bucket.delete(results.map(({ image_key }) => image_key));
  const statements: D1PreparedStatement[] = [];

  // Each row uses three SQL parameters. Stay under D1's per-statement limit of 100.
  for (let offset = 0; offset < results.length; offset += 25) {
    const rows = results.slice(offset, offset + 25);
    const placeholders = rows.map(() => "(?, ?, ?)").join(", ");
    statements.push(db.prepare(`
      DELETE FROM cards
      WHERE show_in_gallery = 0 AND (id, image_key, expires_at) IN (VALUES ${placeholders})
    `).bind(...rows.flatMap(({ id, image_key, expires_at }) => [id, image_key, expires_at])));
  }

  const deleted = await db.batch(statements);
  return deleted.reduce((count, result) => count + result.meta.changes, 0);
}
