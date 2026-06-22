import { CommandInteraction, CacheType, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getOrCreateUser } from '../database/repositories/user.repo.js';
import { getBoxPage } from '../database/repositories/pokedex.repo.js';
import { getEmoji } from '../emoji-config.js';
import { getPokemonList, getSpriteUrl } from '../services/spawn.service.js';
import type { Pokemon, BoxEntry, BoxRarity } from '../models/types.js';

const PER_PAGE = 20;

function getPokemonSprite(dexId: number): string {
  const p = getPokemonList().find(x => x.id === dexId);
  return p ? p.sprite : getSpriteUrl(dexId);
}

const RARITY_EMOJI_FALLBACK: Record<string, string> = {
  mega: '🟢',
  shiny: '🌸',
  legendary: '🟣',
  super_rare: '🟡',
  rare: '🔵',
  uncommon: '🟢',
  common: '⚪',
};

function getRarityEmoji(rarity: string): string {
  const custom = getEmoji(rarity);
  if (custom) return custom;
  return RARITY_EMOJI_FALLBACK[rarity] || '';
}

function fmtBoxEntry(entry: BoxEntry): string {
  const rarityEmoji = getRarityEmoji(entry.rarity);
  return `**${entry.dex_id}** ${rarityEmoji} **${entry.name}** x${entry.quantity}`;
}

function formatBoxEmbed(trainerName: string, page: number, totalPages: number, totalPokemon: number, entries: BoxEntry[], sortBy: string): EmbedBuilder {
  const firstSprite = entries.length > 0 ? getPokemonSprite(entries[0].dex_id) : undefined;
  const left = entries.slice(0, 10);
  const right = entries.slice(10, 20);

  const guidelines = [
    '⭐ **Favorite Pokemon:** ;box fav/unfav {pkmn #/all}',
    '🖥️ **View by region:** ;box {kanto/johto/hoenn/etc}',
    '💠 **View by rarity/type:** ;box {golden/shiny/egg/event/fossil/etc}',
    '👤 **View another user\'s filtered box:** ;box @user {filter}',
  ].join('\n');

  const col1 = [`📖 Page ${page}`, '', ...left.map(fmtBoxEntry)].join('\n');
  const col2 = right.map(fmtBoxEntry).join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setDescription(`${trainerName}'s Box\n\n${guidelines}`)
    .addFields(
      { name: '\u200b', value: col1, inline: true },
      { name: '\u200b', value: col2, inline: true },
    )
    .setThumbnail(firstSprite || null)
    .setFooter({ text: `Box page ${page}/${totalPages} • Total mons: ${totalPokemon.toLocaleString()} • Sorted by: ${sortBy}` });

  return embed;
}

function buildBoxComponents(page: number, totalPages: number): ActionRowBuilder<ButtonBuilder>[] {
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('box_first').setEmoji('⏪').setStyle(ButtonStyle.Primary).setDisabled(page <= 1),
      new ButtonBuilder().setCustomId('box_back').setEmoji('◀️').setLabel('Back').setStyle(ButtonStyle.Primary).setDisabled(page <= 1),
      new ButtonBuilder().setCustomId('box_next').setEmoji('▶️').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(page >= totalPages),
      new ButtonBuilder().setCustomId('box_last').setEmoji('⏩').setStyle(ButtonStyle.Primary).setDisabled(page >= totalPages),
      new ButtonBuilder().setCustomId('box_sort').setEmoji('🔄').setLabel('Sort').setStyle(ButtonStyle.Secondary),
    );
  return [row];
}

function pokedexToBoxEntries(rows: { pokemon_id: number; shiny: number; quantity: number }[]): BoxEntry[] {
  const pokemonMap = new Map<number, Pokemon>();
  for (const p of getPokemonList()) {
    pokemonMap.set(p.id, p);
  }

  const result: BoxEntry[] = [];
  for (const r of rows) {
    const p = pokemonMap.get(r.pokemon_id);
    if (!p) continue;
    const rarity: BoxRarity = r.shiny ? 'shiny' : p.rarity === 'legendary' ? 'legendary' : p.rarity;
    result.push({
      dex_id: p.id,
      name: p.displayName,
      rarity,
      quantity: r.quantity,
      shiny: r.shiny === 1,
    });
  }
  return result;
}

export async function handleBox(interaction: CommandInteraction<CacheType>): Promise<void> {
  await interaction.deferReply();
  const userId = interaction.user.id;
  getOrCreateUser(userId);

  const sortBy = 'Rarity';
  const page = 1;
  const { rows, total } = getBoxPage(userId, sortBy, page, PER_PAGE);
  const entries = pokedexToBoxEntries(rows);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const embed = formatBoxEmbed(interaction.user.username, page, totalPages, total, entries, sortBy);
  await interaction.editReply({ embeds: [embed], components: buildBoxComponents(page, totalPages) });
}

export async function handleTextBox(msg: Message, _args: string[]): Promise<void> {
  const userId = msg.author.id;
  getOrCreateUser(userId);

  const sortBy = 'Rarity';
  const page = 1;
  const { rows, total } = getBoxPage(userId, sortBy, page, PER_PAGE);
  const entries = pokedexToBoxEntries(rows);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const embed = formatBoxEmbed(msg.author.username, page, totalPages, total, entries, sortBy);
  if (!msg.channel.isTextBased() || msg.channel.isDMBased()) return;
  await msg.channel.send({ embeds: [embed], components: buildBoxComponents(page, totalPages) });
}
