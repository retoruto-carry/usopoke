CREATE TABLE cards (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  image_key TEXT NOT NULL UNIQUE,
  show_in_gallery INTEGER NOT NULL CHECK (show_in_gallery IN (0, 1)),
  name TEXT NOT NULL,
  hp TEXT NOT NULL,
  move1_name TEXT NOT NULL,
  move1_damage TEXT NOT NULL,
  move1_info TEXT NOT NULL,
  move2_name TEXT NOT NULL,
  move2_damage TEXT NOT NULL,
  move2_info TEXT NOT NULL,
  twitter_username TEXT,
  expires_at INTEGER,
  CHECK ((show_in_gallery = 1 AND expires_at IS NULL) OR (show_in_gallery = 0 AND expires_at IS NOT NULL))
);
CREATE INDEX cards_expiry ON cards(expires_at) WHERE expires_at IS NOT NULL;

-- Dense slots allow a uniform draw with two indexed lookups, without scanning cards.
-- Gallery cards are retained; deleting one requires compacting its slot first.
CREATE TABLE gallery_cards (
  slot INTEGER PRIMARY KEY,
  card_id TEXT NOT NULL UNIQUE REFERENCES cards(id) ON DELETE RESTRICT
);
CREATE TRIGGER cards_gallery_insert AFTER INSERT ON cards
WHEN NEW.show_in_gallery = 1
BEGIN
  INSERT INTO gallery_cards(slot, card_id)
  SELECT COALESCE(MAX(slot), 0) + 1, NEW.id FROM gallery_cards;
END;
