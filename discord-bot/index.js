import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// Initialize client with gateway intents determining what data your bot receives
const client = new Client({ 
  intents: [GatewayIntentBits.Guilds] 
});

// Lifecycle listener: Triggers when connection handshake finishes successfully
client.once('ready', (c) => {
  console.log(`🚀 Ready! Logged in as ${c.user.tag}`);
});

// Interaction listener: Triggers when a user executes a Slash Command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    
    await interaction.editReply(
      `🏓 Pong!\n• API Latency: \`${latency}ms\`\n• WebSocket Ping: \`${client.ws.ping}ms\``
    );
  }
});

// Authenticate and log into Discord's ecosystem
client.login(process.env.DISCORD_TOKEN);
