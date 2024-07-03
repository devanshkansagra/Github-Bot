const { Client, GatewayIntentBits } = require("discord.js");
const dotenv = require("dotenv");
const discordController = require("./controllers/discordController");

dotenv.config({ path: "./.env" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", discordController.handleMessage);

client.login(process.env.RESET_TOKEN);

module.exports = client;
