# Bag & Box Design

## Database

### pokedex (modified)
- ADD COLUMN `quantity INTEGER DEFAULT 1`
- `addEntry` uses `ON CONFLICT(user_id, pokemon_id, shiny) DO UPDATE SET quantity = quantity + 1`
- `getPokedex` returns quantity field
- `getBoxPage(page, perPage, sort)` — paginated query for Box display

### items (new table)
```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  UNIQUE(user_id, item_name),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```
- On user creation, seed all item types with quantity 0

## Types (types.ts)
- Add new `ItemConfig` interface: name, emoji, section, unicodeFallback
- Expand `BallType` union: add dive, beast, luxury, net, lure, dusk, moon, friend, love, fast, heavy, quick
- Add `BoxEntry` interface: dex_id, name, rarity, quantity, shiny

## Emoji Config
- Extend `emoji-config.ts` to support all item/rarity emoji
- Auto-create on startup for each guild
- Fallback Unicode map for items that fail to create

## Bag (`;bag` / `/bag`)
- Query `items` + `inventory` tables, merge by sections
- 3-column embed: Left=Currencies+Event, Middle=Balls, Right=Fishing+Eggs+Catching
- Items with quantity 0 are still shown (per user spec)
- Pagination via Back/Next buttons (7 pages)
- Additional: Item Info button, Berry Pouch button

## Box (`;box` / `/box`)
- Query `pokedex` with pagination, lookup pokemon name/rarity from pokedex.json
- 2-column embed: 10 Pokémon per column, sorted by rarity
- Guidelines in description
- Pagination via First/Back/Next/Last buttons
- Sort button to toggle sort method
