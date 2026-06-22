import { readFileSync } from 'fs';
import path from 'path';
import { ENCOUNTER_WEIGHTS } from '../config.js';
import type { Pokemon, Rarity } from '../models/types.js';

let pokemonList: Pokemon[] | null = null;

function loadPokemon(): Pokemon[] {
  if (!pokemonList) {
    const filePath = path.resolve('./data/pokedex.json');
    pokemonList = JSON.parse(readFileSync(filePath, 'utf-8')) as Pokemon[];
  }
  return pokemonList!;
}

export function getPokemonList(): Pokemon[] {
  return loadPokemon();
}

export function getRandomPokemon(): Pokemon {
  const all = loadPokemon();
  const entries = Object.entries(ENCOUNTER_WEIGHTS) as [Rarity, number][];
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  let selectedRarity: Rarity = 'common';
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      selectedRarity = rarity;
      break;
    }
  }
  const pool = all.filter(p => p.rarity === selectedRarity);
  if (pool.length === 0) {
    return all[Math.floor(Math.random() * all.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
