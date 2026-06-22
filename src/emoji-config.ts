import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const CONFIG_PATH = resolve('data/emoji-config.json');

interface EmojiConfig {
  [ballType: string]: string;
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

export function saveEmojiConfig(config: EmojiConfig): void {
  cache = config;
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
