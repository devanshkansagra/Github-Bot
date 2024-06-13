const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

dotenv.config({path: "./.env"});

let repoUrl = '';

client.on('messageCreate', (message) => {
    if(message.author.bot) return;

    if(message.content.startsWith("track")) {
        let url = message.content.split("track")[1];
        repoUrl = url;
        message.reply({
            content: "Tracking the github repository: " + url
        });
    }
    else if(message.content === 'Hi') {
        message.reply({
            content: `Hi! ${message.author.username}`
        })
    }
    
})
client.login(process.env.RESET_TOKEN);