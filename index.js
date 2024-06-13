const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

dotenv.config({path: "./.env"});

client.on('messageCreate', (message) => {
    if(message.author.bot) return;
    message.reply({
        content: `Hi! ${message.author.username}`
    })
})

client.login(process.env.RESET_TOKEN);