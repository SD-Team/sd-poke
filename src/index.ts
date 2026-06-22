import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { DISCORD_TOKEN } from './config.js';
import { getDb } from './database/connection.js';
import { handleSpawn } from './commands/spawn.js';
import { handleSetupEmoji } from './commands/setup-emoji.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const commands = [
    new SlashCommandBuilder()
      .setName('spawn')
      .setDescription('Spawn a wild Pokémon to catch!'),
    new SlashCommandBuilder()
      .setName('setup-emoji')
      .setDescription('Upload ball emoji icons to this server')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
  ];

  try {
    await rest.put(Routes.applicationCommands(client.user!.id), { body: commands });
    console.log('✅ Slash commands registered');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'spawn') {
    await handleSpawn(interaction);
  } else if (interaction.commandName === 'setup-emoji') {
    await handleSetupEmoji(interaction);
  }
});

getDb();
console.log('✅ Database initialized');

client.login(DISCORD_TOKEN).catch((err) => {
  console.error('❌ Failed to login:', err);
  process.exit(1);
});
