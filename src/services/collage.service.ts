import { createCanvas, loadImage } from 'canvas';
import type { Pokemon } from '../models/types.js';
import { getPokemonList } from './spawn.service.js';

const SPRITE_SIZE = 96;
const COLS = 4;
const ROWS = 5;
const PADDING = 2;

function getStaticSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export async function createPokemonGrid(entries: { dex_id: number }[]): Promise<Buffer | null> {
  if (entries.length === 0) return null;

  const count = Math.min(entries.length, COLS * ROWS);
  const width = COLS * (SPRITE_SIZE + PADDING) + PADDING;
  const rowsNeeded = Math.ceil(count / COLS);
  const height = rowsNeeded * (SPRITE_SIZE + PADDING) + PADDING;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < count; i++) {
    const entry = entries[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PADDING + col * (SPRITE_SIZE + PADDING);
    const y = PADDING + row * (SPRITE_SIZE + PADDING);

    try {
      const url = getStaticSpriteUrl(entry.dex_id);
      const img = await loadImage(url);
      ctx.drawImage(img, x, y, SPRITE_SIZE, SPRITE_SIZE);
    } catch {
      // skip failed sprites
    }
  }

  return canvas.toBuffer('image/png');
}
