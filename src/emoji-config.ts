import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { Guild } from 'discord.js';

const CONFIG_PATH = resolve('data/emoji-config.json');
const EMOJI_TYPES = ['pokeball', 'greatball', 'ultraball', 'premierball', 'masterball',
  'diveball', 'beastball', 'luxuryball', 'netball', 'lureball',
  'duskball', 'moonball', 'friendball', 'loveball', 'fastball',
  'heavyball', 'quickball',
  'pokecoin', 'fishingtoken', 'patreontoken', 'votecoin', 'swapticket',
  'safariticket', 'eventticket', 'eventvoucher',
  'pokelure', 'mistyslure', 'seaflute',
  'egg', 'incubator', 'superincubator',
  'repel', 'superrepel', 'maxrepel', 'honey', 'grazzberry', 'incense', 'lootbox', 'pokeradar',
  'researchpoints', 'battlepoints',
  'mega', 'shiny', 'legendary',
];

interface EmojiConfig {
  [name: string]: string;
}

let cache: EmojiConfig | null = null;

export function loadEmojiConfig(): EmojiConfig {
  if (cache) return cache;
  if (existsSync(CONFIG_PATH)) {
    cache = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as EmojiConfig;
  } else {
    cache = {};
  }
  return cache;
}

export function getBallEmoji(ballType: string): string {
  const config = loadEmojiConfig();
  return config[ballType] || '';
}

export function getEmoji(name: string): string {
  const config = loadEmojiConfig();
  return config[name] || '';
}

function saveEmojiConfig(config: EmojiConfig): void {
  cache = config;
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function ensureEmoji(guild: Guild): Promise<void> {
  if (!guild.members.me?.permissions.has('ManageGuildExpressions')) return;

  const existing = guild.emojis.cache;
  const config: EmojiConfig = { ...loadEmojiConfig() };

  const BALLS_DIR = resolve('data/balls');
  for (const name of EMOJI_TYPES) {
    if (config[name]) continue;
    const found = existing.find(e => e.name === name);
    if (found) {
      config[name] = `<:${found.name}:${found.id}>`;
      continue;
    }
    const filePath = resolve(BALLS_DIR, `${name}.png`);
    if (!existsSync(filePath)) continue;
    try {
      const emoji = await guild.emojis.create({
        attachment: readFileSync(filePath),
        name,
      });
      config[name] = `<:${emoji.name}:${emoji.id}>`;
    } catch {
      // skip
    }
  }

  if (Object.keys(config).length > 0) {
    saveEmojiConfig(config);
  }
}
