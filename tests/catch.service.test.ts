import { describe, it, expect } from 'vitest';
import { calculateCatchRate, calculateCoins } from '../src/services/catch.service.js';

describe('CatchService', () => {
  describe('calculateCatchRate', () => {
    it('should be 80 for common + pokeball', () => {
      expect(calculateCatchRate('common', 'pokeball')).toBe(80);
    });

    it('should be 100 for common + masterball', () => {
      expect(calculateCatchRate('common', 'masterball')).toBe(100);
    });

    it('should cap at 100', () => {
      expect(calculateCatchRate('common', 'ultraball')).toBe(100);
    });

    it('should be 45 for legendary + ultraball', () => {
      expect(calculateCatchRate('legendary', 'ultraball')).toBe(45);
    });

    it('should be 20 for legendary + pokeball', () => {
      expect(calculateCatchRate('legendary', 'pokeball')).toBe(20);
    });
  });

  describe('calculateCoins', () => {
    it('should return base coins for common at streak 0', () => {
      expect(calculateCoins('common', 0, 0)).toBe(150);
    });

    it('should increase with streak', () => {
      expect(calculateCoins('common', 1, 0)).toBe(165);
    });

    it('should increase with amulet coins', () => {
      expect(calculateCoins('common', 0, 5)).toBe(187);
    });

    it('should stack streak and amulet', () => {
      expect(calculateCoins('legendary', 2, 10)).toBe(18000);
    });
  });
});
