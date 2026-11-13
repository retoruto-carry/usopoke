import type { Card } from "~/types/card";
import type { CardRepository } from "./cardRepository";
import { cardImageKeyFromPath, cardImagePath, isCardImageKey } from "./r2ImageStore.server";

const retentionSeconds = 14 * 24 * 60 * 60;

type CardRow = Omit<Card, "image_url" | "show_in_gallery"> & {
  image_key: string;
  show_in_gallery: 0 | 1;
  expires_at: number | null;
};

type CardExpiry = Pick<CardRow, "expires_at">;

function toCard(row: CardRow): Card {
  return {
    id: row.id,
    created_at: row.created_at,
    image_url: cardImagePath(row.image_key),
    show_in_gallery: row.show_in_gallery === 1,
    name: row.name,
    hp: row.hp,
    move1_name: row.move1_name,
    move1_damage: row.move1_damage,
    move1_info: row.move1_info,
    move2_name: row.move2_name,
    move2_damage: row.move2_damage,
    move2_info: row.move2_info,
    twitter_username: row.twitter_username,
  };
}

function randomSlot(maxSlot: number): number | null {
  const range = 2 ** 53;
  const limit = range - (range % maxSlot);
  const words = new Uint32Array(2);

  // Reject the incomplete final interval so every slot has the same probability.
  for (let attempt = 0; attempt < 8; attempt++) {
    crypto.getRandomValues(words);
    const value = (words[0] & 0x1fffff) * 2 ** 32 + words[1];
    if (value < limit) return (value % maxSlot) + 1;
  }

  return null;
}

type D1CardRepository = CardRepository & {
  getCardWithExpiry(id: string): Promise<(Card & CardExpiry) | null>;
  getCardImageExpiry(key: string): Promise<CardExpiry | null>;
};

export function createD1CardRepository(db: D1Database): D1CardRepository {
  function getCardRow(id: string) {
    return db.prepare(`
      SELECT * FROM cards
      WHERE id = ? AND (expires_at IS NULL OR expires_at > unixepoch())
    `).bind(id).first<CardRow>();
  }

  return {
    async getCard(id) {
      const row = await getCardRow(id);
      return row ? toCard(row) : null;
    },

    async getCardWithExpiry(id) {
      const row = await getCardRow(id);
      return row ? { ...toCard(row), expires_at: row.expires_at } : null;
    },

    async getCardImageExpiry(key) {
      if (!isCardImageKey(key)) return null;

      return db.prepare(`
        SELECT expires_at FROM cards
        WHERE image_key = ? AND (expires_at IS NULL OR expires_at > unixepoch())
      `).bind(key).first<CardExpiry>();
    },

    async getRandomCard() {
      const maxSlot = await db.prepare("SELECT MAX(slot) AS slot FROM gallery_cards")
        .first<number | null>("slot");
      if (!maxSlot) return null;

      const slot = randomSlot(maxSlot);
      if (slot === null) return null;

      const row = await db.prepare(`
        SELECT cards.* FROM gallery_cards
        JOIN cards ON cards.id = gallery_cards.card_id
        WHERE gallery_cards.slot = ?
      `).bind(slot).first<CardRow>();
      return row ? toCard(row) : null;
    },

    async insertCard(data) {
      const key = cardImageKeyFromPath(data.image_url);
      if (key === null) throw new Error("画像の保存先が無効です");

      const id = crypto.randomUUID();
      const now = Date.now();
      const createdAt = new Date(now).toISOString();
      const expiresAt = data.show_in_gallery ? null : Math.floor(now / 1000) + retentionSeconds;
      const row = await db.prepare(`
        INSERT INTO cards (
          id, created_at, image_key, show_in_gallery, name, hp,
          move1_name, move1_damage, move1_info, move2_name, move2_damage, move2_info,
          twitter_username, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
        id, createdAt, key, Number(data.show_in_gallery), data.name, data.hp,
        data.move1_name, data.move1_damage, data.move1_info,
        data.move2_name, data.move2_damage, data.move2_info, data.twitter_username, expiresAt,
      ).first<CardRow>();

      if (!row) throw new Error("データベースの保存に失敗しました");

      return toCard(row);
    },
  };
}
