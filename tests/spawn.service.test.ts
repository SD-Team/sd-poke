import { describe, it, expect } from 'vitest';
import { getRandomPokemon, getPokemonList } from '../src/services/spawn.service.js';

describe('SpawnService', () => {
  it('should return a list of pokemon', () => {
    const list = getPokemonList();
    expect(list.length).toBeGreaterThan(0);
  });

  it('should return a valid pokemon with all required fields', () => {
    const pokemon = getRandomPokemon();
    expect(pokemon).toHaveProperty('id');
    expect(pokemon).toHaveProperty('name');
    expect(pokemon).toHaveProperty('displayName');
    expect(pokemon).toHaveProperty('rarity');
    expect(pokemon).toHaveProperty('types');
    expect(pokemon).toHaveProperty('sprite');
  });

  it('should only return defined rarities', () => {
    const valid = ['common', 'uncommon', 'rare', 'super_rare', 'legendary'];
    for (let i = 0; i < 100; i++) {
      const pokemon = getRandomPokemon();
      expect(valid).toContain(pokemon.rarity);
    }
  });
});
