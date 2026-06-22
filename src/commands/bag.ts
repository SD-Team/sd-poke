import { CommandInteraction, CacheType, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getOrCreateUser } from '../database/repositories/user.repo.js';
import { getBalls } from '../database/repositories/inventory.repo.js';
import { getAllItems } from '../database/repositories/items.repo.js';
import { getEmoji } from '../emoji-config.js';
import { BALLS, BALL_ORDER, ITEMS_CONFIG, BAG_PAGE_SIZE } from '../config.js';

const BALL_SECTION_ORDER = ['pokeball', 'greatball', 'ultraball', 'diveball', 'masterball',
  'beastball', 'premierball', 'luxuryball', 'netball', 'lureball',
  'duskball', 'moonball', 'friendball', 'loveball', 'fastball',
  'heavyball', 'quickball'];

function fmtBall(ballKey: string, qty: number): string {
  const e = getEmoji(ballKey) || BALLS[ballKey]?.emoji || '';
  const label = BALLS[ballKey]?.label || ballKey;
  return `${e} ${qty.toLocaleString()}x ${label}`;
}

function fmtItem(name: string, qty: number, meta?: Record<string, unknown>): string {
  const cfg = ITEMS_CONFIG[name];
  const e = getEmoji(name) || cfg?.unicodeFallback || '';
  let line = `${e} ${qty.toLocaleString()}x ${name}`;
  if (meta && meta.badge) line += ` [${meta.badge}]`;
  return line;
}

function formatBagEmbed(trainerName: string, page: number, totalPages: number, balls: Record<string, number>, items: Record<string, { quantity: number; metadata: Record<string, unknown> }>): EmbedBuilder {
  const currencies = ['PokeCoins', 'Fishing tokens', 'Patreon tokens', 'Research Points', 'Vote coins', 'Battle Points', 'Swap tokens', 'Safari Tickets'];
  const event = ['Event tickets', 'Event vouchers'];
  const fishing = ['Pokelures', "Misty's lure", 'Sea flutes'];
  const eggs = ['Eggs', 'Incubators', 'Super Incubators'];
  const catching = ['Repels', 'Super Repels', 'Max Repels', 'Honey', 'GRazz Berries', 'Incenses', 'Lootboxes', 'Pokeradars'];

  const col1Lines: string[] = [];
  col1Lines.push('**Currencies**');
  for (const name of currencies) {
    const d = items[name] || { quantity: 0, metadata: {} };
    col1Lines.push(fmtItem(name, d.quantity, d.metadata));
  }
  col1Lines.push('');
  col1Lines.push('**Event**');
  for (const name of event) {
    const d = items[name] || { quantity: 0, metadata: {} };
    col1Lines.push(fmtItem(name, d.quantity, d.metadata));
  }

  const col2Lines: string[] = [];
  col2Lines.push('**Balls**');
  for (const bk of BALL_SECTION_ORDER) {
    const q = balls[bk] || 0;
    col2Lines.push(fmtBall(bk, q));
  }

  const col3Lines: string[] = [];
  col3Lines.push('**Fishing**');
  for (const name of fishing) {
    const d = items[name] || { quantity: 0, metadata: {} };
    col3Lines.push(fmtItem(name, d.quantity, d.metadata));
  }
  col3Lines.push('');
  col3Lines.push('**Eggs**');
  for (const name of eggs) {
    const d = items[name] || { quantity: 0, metadata: {} };
    col3Lines.push(fmtItem(name, d.quantity, d.metadata));
  }
  col3Lines.push('');
  col3Lines.push('**Catching**');
  for (const name of catching) {
    const d = items[name] || { quantity: 0, metadata: {} };
    let line = fmtItem(name, d.quantity, d.metadata);
    if (name === 'GRazz Berries' && d.metadata?.berry_uses) {
      line += `\n• [${d.metadata.berry_uses} uses left]`;
    }
    col3Lines.push(line);
  }

  const embed = new EmbedBuilder()
    .setColor(0xFF6F00)
    .setDescription(`${trainerName}'s item inventory`)
    .addFields(
      { name: '\u200b', value: col1Lines.join('\n'), inline: true },
      { name: '\u200b', value: col2Lines.join('\n'), inline: true },
      { name: '\u200b', value: col3Lines.join('\n'), inline: true },
    )
    .setFooter({ text: `Page ${page}/${totalPages} • ;item info {item_name} for specific item info` });
  return embed;
}

function buildBagComponents(page: number, totalPages: number): ActionRowBuilder<ButtonBuilder>[] {
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('bag_back').setEmoji('⬅️').setLabel('Back').setStyle(ButtonStyle.Primary).setDisabled(page <= 1),
      new ButtonBuilder().setCustomId('bag_next').setEmoji('➡️').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(page >= totalPages),
      new ButtonBuilder().setCustomId('bag_iteminfo').setEmoji('🔍').setLabel('Item Info').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('bag_berrypouch').setEmoji('💰').setLabel('Berry Pouch').setStyle(ButtonStyle.Success),
    );
  return [row];
}

export async function handleBag(interaction: CommandInteraction<CacheType>): Promise<void> {
  await interaction.deferReply();
  const userId = interaction.user.id;
  const user = getOrCreateUser(userId);
  const balls = getBalls(userId);
  const itemRows = getAllItems(userId);
  const items: Record<string, { quantity: number; metadata: Record<string, unknown> }> = {};
  for (const r of itemRows) {
    let meta: Record<string, unknown> = {};
    try { meta = JSON.parse(r.metadata); } catch {}
    items[r.item_name] = { quantity: r.quantity, metadata: meta };
  }
  const totalPages = BAG_PAGE_SIZE;
  const embed = formatBagEmbed(interaction.user.username, 1, totalPages, balls, items);
  const msg = await interaction.editReply({ embeds: [embed], components: buildBagComponents(1, totalPages) });
}

export async function handleTextBag(msg: Message, _args: string[]): Promise<void> {
  const userId = msg.author.id;
  const user = getOrCreateUser(userId);
  const balls = getBalls(userId);
  const itemRows = getAllItems(userId);
  const items: Record<string, { quantity: number; metadata: Record<string, unknown> }> = {};
  for (const r of itemRows) {
    let meta: Record<string, unknown> = {};
    try { meta = JSON.parse(r.metadata); } catch {}
    items[r.item_name] = { quantity: r.quantity, metadata: meta };
  }
  const totalPages = BAG_PAGE_SIZE;
  const embed = formatBagEmbed(msg.author.username, 1, totalPages, balls, items);
  if (!msg.channel.isTextBased() || msg.channel.isDMBased()) return;
  await msg.channel.send({ embeds: [embed], components: buildBagComponents(1, totalPages) });
}
