import { CommandInteraction, CacheType, Guild } from 'discord.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { saveEmojiConfig } from '../emoji-config.js';

const BALL_NAMES = ['pokeball', 'greatball', 'ultraball', 'premierball', 'masterball'];

export async function handleSetupEmoji(interaction: CommandInteraction<CacheType>): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: '❌ This command must be used in a server.', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions?.has('ManageGuildExpressions')) {
    await interaction.reply({ content: '❌ You need **Manage Emojis** permission.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild as Guild;
  const existingEmojis = guild.emojis.cache;
  const created: string[] = [];
  const errors: string[] = [];
  const config: Record<string, string> = {};

  for (const name of BALL_NAMES) {
    const path = resolve('data/balls', `${name}.png`);
    if (!existsSync(path)) {
      errors.push(`${name}: file not found`);
      continue;
    }

    const existing = existingEmojis.find(e => e.name === name);
    if (existing) {
      config[name] = `<:${existing.name}:${existing.id}>`;
      created.push(`${name}: reused existing`);
      continue;
    }

    try {
      const buffer = readFileSync(path);
      const emoji = await guild.emojis.create({
        attachment: buffer,
        name,
      });
      config[name] = `<:${emoji.name}:${emoji.id}>`;
      created.push(`${name}: created`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('already exists')) {
        const existing2 = guild.emojis.cache.find(e => e.name === name);
        if (existing2) {
          config[name] = `<:${existing2.name}:${existing2.id}>`;
          created.push(`${name}: found existing`);
          continue;
        }
      }
      errors.push(`${name}: ${msg}`);
    }
  }

  saveEmojiConfig(config);

  let reply = '## 🎨 Emoji Setup Complete\n';
  if (created.length > 0) {
    reply += `\n✅ Created/found:\n${created.map(c => `- ${c}`).join('\n')}`;
  }
  if (errors.length > 0) {
    reply += `\n\n❌ Errors:\n${errors.map(e => `- ${e}`).join('\n')}`;
  }

  await interaction.editReply({ content: reply });
}
