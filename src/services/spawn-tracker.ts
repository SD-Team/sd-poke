import type { Message } from 'discord.js';
import type { Pokemon } from '../models/types.js';

interface ActiveSpawn {
  pokemon: Pokemon;
  userBalls: Record<string, number>;
  currentStreak: number;
  totalCaught: number;
  message: Message;
  timestamp: number;
}

const activeSpawns = new Map<string, ActiveSpawn>();

export function setActiveSpawn(channelId: string, data: ActiveSpawn): void {
  activeSpawns.set(channelId, data);
}

export function getActiveSpawn(channelId: string): ActiveSpawn | undefined {
  return activeSpawns.get(channelId);
}

export function removeActiveSpawn(channelId: string): void {
  activeSpawns.delete(channelId);
}
