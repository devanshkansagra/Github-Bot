const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./models/user');

const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const app = express();
const corsOptions = {
    origin: 'http://api.github.com/',
    methods: 'GET',
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

dotenv.config({ path: "./.env" });

const DB = "mongodb://localhost:27017/discordGitBot" || process.env.DATABASE;

mongoose.connect(DB).then(() => {
    console.log("Databse connected Successfully")
}).catch((error) => {
    console.log(error);
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith("!track")) {
        let repoUrl = message.content.split(' ')[1];
        let guildId = message.guildId;
        let channelId = message.channelId;
        let repoName = repoUrl.split('/').pop();

        const owner = new URL(repoUrl).pathname.split('/')[1];


        const validateUrl = await User.findOne({ repoUrl: repoUrl });
        if (validateUrl) {
            message.reply({
                content: "This repository is already being tracked"
            })
        }
        else {
            console.log("Repo Url:", repoUrl);
            console.log("Guild Id:", guildId);
            console.log("Repo Name:", repoName);
            console.log("Owner: ", owner);

            const newUser = new User({ guildId: guildId, channelId: channelId, repoUrl: repoUrl, repoName: repoName, owner: owner })

            const userSave = await newUser.save();

            if (userSave) {
                message.reply({
                    content: "Tracking the repository: " + repoUrl
                })
            }

        }
    }
    else if (message.content.startsWith("!getCommits")) {

        let repoName = message.content.split(' ')[1];
        let repo = await User.findOne({ repoName: repoName });
        if (repo) {
            let owner = repo.owner;
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/commits`)
            const data = await response.data;
            if (response) {
                let commits = ''
                if (data.length > 0) {
                    data.forEach((entity) => {
                        commits += `Commit Message: ${entity.commit.message} \nAuthor: ${entity.author.login}\n\n`;
                    })
                }

                if (commits.length <= 2000) {
                    message.reply({ content: commits });
                }
                else {
                    const chunks = commits.match(/[\s\S]{1,2000}/g);
                    for (const chunk of chunks) {
                        await message.reply({ content: chunk })
                    }
                }
            }
        }
        else {
            message.reply({ content: "No Repository found!!!" });
        }

    }
    else if (message.content.startsWith("!getIssues")) {
        let repoName = message.content.split(' ')[1];
        let repo = await User.findOne({ repoName: repoName });

        if (repo) {
            let owner = repo.owner;
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/issues`)
            const data = await response.data;
            let issues = "";
            if (data) {
                if (data.length > 0) {
                    data.forEach((entity) => {
                        issues += `Issue number: ${entity.number} \nIssue Title: ${entity.title} \nIssue Body: ${entity.body}\n\n`
                    })
                }

                if (issues.length <= 2000) {
                    message.reply({ content: issues });
                }
                else {
                    const chunks = issues.match(/[\s\S]{1,2000}/g);
                    for (const chunk of chunks) {
                        await message.reply({ content: chunk })
                    }
                }
            }
        }
        else {
            message.reply({
                content: "No Repository found!!!"
            })
        }
    }
    else if (message.content.startsWith("!getPullRequests")) {
        let repoName = message.content.split(' ')[1];
        let repo = await User.findOne({ repoName: repoName });

        if (repo) {
            let owner = repo.owner;
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/pulls`)
            const data = await response.data;
            let prs = "";
            if (data) {
                if (data.length > 0) {
                    data.forEach((entity) => {
                        prs += `Pull Request number: ${entity.number} \nPull Request Title: ${entity.title} \nPull Request Body: ${entity.body} \nPull Request State: ${entity.state}\n\n`
                    })
                }

                if (prs.length <= 2000) {
                    message.reply({ content: issues });
                }
                else {
                    const chunks = prs.match(/[\s\S]{1,2000}/g);
                    for (const chunk of chunks) {
                        await message.reply({ content: chunk })
                    }
                }
            }
        }
        else {
            message.reply({
                content: "No Repository found!!!"
            })
        }
    }
    else if (message.content === 'Hi') {
        message.reply({
            content: `Hi! ${message.author.username}`
        })
    }

})

client.login(process.env.RESET_TOKEN);

