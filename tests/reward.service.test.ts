import { describe, it, expect } from 'vitest';
import { buildSpawnEmbed, buildResultEmbed } from '../src/services/reward.service.js';
import type { Pokemon, CatchResult } from '../src/models/types.js';

const testPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  types: ['electric'],
  rarity: 'common',
  sprite: 'https://example.com/pikachu.png',
};

describe('RewardService', () => {
  it('should build spawn embed with correct description', () => {
    const { embeds } = buildSpawnEmbed(testPokemon, { pokeball: 10 }, 0, 5);
    expect(embeds[0].data.description).toContain('Pikachu');
  });

  it('should disable button when ball count is 0', () => {
    const { components } = buildSpawnEmbed(testPokemon, { pokeball: 0, greatball: 0, ultraball: 0, premierball: 0, masterball: 0 }, 0, 0);
    const buttons = components.flatMap(r => r.components);
    for (const btn of buttons) {
      expect(btn.data.disabled).toBe(true);
    }
  });

  it('should enable button when ball count > 0', () => {
    const balls = { pokeball: 5, greatball: 0, ultraball: 0, premierball: 0, masterball: 0 };
    const { components } = buildSpawnEmbed(testPokemon, balls, 0, 0);
    expect(components[0].components[0].data.disabled).toBe(false);
  });

  it('should build success result embed', () => {
    const result: CatchResult = {
      success: true, pokemon: testPokemon, ballUsed: 'pokeball',
      catchRate: 80, roll: 45, coinsEarned: 150, newStreak: 3, totalCaught: 10,
    };
    const { embeds } = buildResultEmbed(result);
    expect(embeds[0].data.description).toContain('caught');
  });

  it('should build failure result embed', () => {
    const result: CatchResult = {
      success: false, pokemon: testPokemon, ballUsed: 'ultraball',
      catchRate: 100, roll: 95, coinsEarned: 0, newStreak: 0, totalCaught: 10,
    };
    const { embeds } = buildResultEmbed(result);
    expect(embeds[0].data.description).toContain('broke out');
  });
});
