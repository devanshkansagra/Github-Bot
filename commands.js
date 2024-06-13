const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config({path: './.env'});

const commands = [
    {
        name: 'track',
        description: 'Tracks the Github Repository',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.RESET_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})()