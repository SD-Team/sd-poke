import 'dotenv/config';
import type { BallConfig, Rarity } from './models/types.js';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';

export const COOLDOWN_MS = 7000;
export const CATCH_TIMEOUT_MS = 30000;

export const BALLS: Record<string, BallConfig> = {
  pokeball:   { type: 'pokeball',   bonus: 10,  emoji: '🔴', label: 'Pokéball' },
  greatball:  { type: 'greatball',  bonus: 25,  emoji: '🔵', label: 'Greatball' },
  ultraball:  { type: 'ultraball',  bonus: 35,  emoji: '🟡', label: 'Ultraball' },
  premierball:{ type: 'premierball',bonus: 50,  emoji: '⚪', label: 'Premierball' },
  masterball: { type: 'masterball', bonus: 100, emoji: '💜', label: 'Masterball' },
  diveball:   { type: 'diveball',   bonus: 15,  emoji: '🔵', label: 'Diveball' },
  beastball:  { type: 'beastball',  bonus: 40,  emoji: '🔵', label: 'Beastball' },
  luxuryball: { type: 'luxuryball', bonus: 10,  emoji: '⚫', label: 'Luxuryball' },
  netball:    { type: 'netball',    bonus: 20,  emoji: '🔵', label: 'Netball' },
  lureball:   { type: 'lureball',   bonus: 20,  emoji: '🔵', label: 'Lureball' },
  duskball:   { type: 'duskball',   bonus: 25,  emoji: '🟢', label: 'Duskball' },
  moonball:   { type: 'moonball',   bonus: 20,  emoji: '🔵', label: 'Moonball' },
  friendball: { type: 'friendball', bonus: 15,  emoji: '🟢', label: 'Friendball' },
  loveball:   { type: 'loveball',   bonus: 15,  emoji: '💖', label: 'Loveball' },
  fastball:   { type: 'fastball',   bonus: 25,  emoji: '🟡', label: 'Fastball' },
  heavyball:  { type: 'heavyball',  bonus: 20,  emoji: '🔵', label: 'Heavyball' },
  quickball:  { type: 'quickball',  bonus: 30,  emoji: '🔵', label: 'Quickball' },
};

export const BALL_ORDER: string[] = [
  'pokeball', 'greatball', 'ultraball', 'diveball', 'masterball',
  'beastball', 'premierball', 'luxuryball', 'netball', 'lureball',
  'duskball', 'moonball', 'friendball', 'loveball', 'fastball',
  'heavyball', 'quickball',
];

export const BASE_CATCH_RATES: Record<Rarity, number> = {
  common: 70,
  uncommon: 60,
  rare: 50,
  super_rare: 30,
  legendary: 10,
};

export const ENCOUNTER_WEIGHTS: Record<Rarity, number> = {
  common: 400,
  uncommon: 300,
  rare: 150,
  super_rare: 100,
  legendary: 1,
};

export const BASE_COINS: Record<Rarity, number> = {
  common: 150,
  uncommon: 300,
  rare: 500,
  super_rare: 1000,
  legendary: 10000,
};

export const STREAK_BONUS_COINS_MULTIPLIER = 0.1;

export const STARTER_INVENTORY: Record<string, number> = {
  pokeball: 50,
  greatball: 30,
  ultraball: 10,
  premierball: 1,
  masterball: 1,
};

export const BAG_PAGE_SIZE = 7;

export const ITEMS_CONFIG: Record<string, { emoji: string; unicodeFallback: string; section: string; metadata?: boolean }> = {
  'PokeCoins':          { emoji: '<:pokecoin:>',         unicodeFallback: '🟡', section: 'Currencies' },
  'Fishing tokens':     { emoji: '<:fishingtoken:>',     unicodeFallback: '🪙', section: 'Currencies' },
  'Patreon tokens':     { emoji: '<:patreontoken:>',     unicodeFallback: '🔴', section: 'Currencies' },
  'Research Points':    { emoji: '<:researchpoints:>',   unicodeFallback: '🗡️', section: 'Currencies' },
  'Vote coins':         { emoji: '<:votecoin:>',         unicodeFallback: '🟡', section: 'Currencies' },
  'Battle Points':      { emoji: '<:battlepoints:>',     unicodeFallback: '🪙', section: 'Currencies' },
  'Swap tokens':        { emoji: '<:swapticket:>',       unicodeFallback: '🎟️', section: 'Currencies' },
  'Safari Tickets':     { emoji: '<:safariticket:>',     unicodeFallback: '🎟️', section: 'Currencies' },
  'Event tickets':      { emoji: '<:eventticket:>',      unicodeFallback: '🎟️', section: 'Event', metadata: true },
  'Event vouchers':     { emoji: '<:eventvoucher:>',     unicodeFallback: '🎟️', section: 'Event' },
  'Pokelures':          { emoji: '<:pokelure:>',         unicodeFallback: '🎣', section: 'Fishing' },
  "Misty's lure":       { emoji: '<:mistyslure:>',       unicodeFallback: '👩', section: 'Fishing' },
  'Sea flutes':         { emoji: '<:seaflute:>',         unicodeFallback: '🎺', section: 'Fishing' },
  'Eggs':               { emoji: '<:egg:>',              unicodeFallback: '🥚', section: 'Eggs' },
  'Incubators':         { emoji: '<:incubator:>',        unicodeFallback: '🧪', section: 'Eggs' },
  'Super Incubators':   { emoji: '<:superincubator:>',   unicodeFallback: '🧪', section: 'Eggs' },
  'Repels':             { emoji: '<:repel:>',            unicodeFallback: '🧪', section: 'Catching' },
  'Super Repels':       { emoji: '<:superrepel:>',       unicodeFallback: '🧪', section: 'Catching' },
  'Max Repels':         { emoji: '<:maxrepel:>',         unicodeFallback: '🧪', section: 'Catching' },
  'Honey':              { emoji: '<:honey:>',            unicodeFallback: '🍯', section: 'Catching' },
  'GRazz Berries':      { emoji: '<:grazzberry:>',       unicodeFallback: '🍇', section: 'Catching', metadata: true },
  'Incenses':           { emoji: '<:incense:>',          unicodeFallback: '🍯', section: 'Catching' },
  'Lootboxes':          { emoji: '<:lootbox:>',          unicodeFallback: '📦', section: 'Catching' },
  'Pokeradars':         { emoji: '<:pokeradar:>',        unicodeFallback: '📟', section: 'Catching' },
};

export const ITEM_NAMES = Object.keys(ITEMS_CONFIG);
