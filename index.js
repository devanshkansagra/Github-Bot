const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./models/user');
const { Octokit } = require("@octokit/rest");

const { Client, GatewayIntentBits } = require('discord.js');
const TokenDoc = require('./models/tokenSchema');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const app = express();
const corsOptions = {
    origin: 'http://api.github.com/',
    methods: ['GET', 'POST'],
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

client.once('ready', () => {
    console.log("Client is ready");
})

let GITHUB_ACCESS_TOKEN = ""

const createWebHook = async (channelId, name) => {
    try {
        const channel = await client.channels.fetch(channelId);
        const webhook = await channel.createWebhook({ name: name });
        if (webhook) {
            return webhook.url;
        }
    } catch (error) {
        console.log("Error: ", error);
    }
}

const linkWithGithub = async (gitToken, owner, repoName, webhookURL) => {
    const octokit = new Octokit({ auth: gitToken });
    try {
        const link = await octokit.request("POST /repos/{owner}/{repo}/hooks", {
            owner: owner,
            repo: repoName,
            events: [
                'push',
                'pull_request',
            ],
            config: {
                url: webhookURL,
                content_type: 'json',
                insecure_ssl: '0'
            },
        })
        if(link) {
            console.log("Integration successfull");
        }
    } catch (error) {
        console.log(error);
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith("!settoken")) {
        const token = message.content.split(' ')[1];
        GITHUB_ACCESS_TOKEN = token
        const guildId = message.guildId;

        const validateToken = await TokenDoc.findOne({ accessToken: GITHUB_ACCESS_TOKEN });
        if (validateToken) {
            message.reply({ content: "Token is set already" });
        }
        else {
            const newToken = new TokenDoc({ guildId: guildId, accessToken: GITHUB_ACCESS_TOKEN });
            const saveToken = await newToken.save();
            if (saveToken) {
                message.reply({
                    content: "Github access token is set successfully, you are authorized!"
                })
            }
            else {
                message.reply({
                    content: "Unable to set the access token"
                })
            }

        }
    }

    if (message.content.startsWith("!track")) {
        let repoUrl = message.content.split(' ')[1];
        let guildId = message.guildId;
        let channelId = message.channelId;
        let repoName = repoUrl.split('/').pop();

        const webhook = await createWebHook(channelId, repoName);

        const owner = new URL(repoUrl).pathname.split('/')[1];

        const validateUrl = await User.findOne({ repoUrl: repoUrl });

        const isAuthenticated = await TokenDoc.findOne({ accessToken: GITHUB_ACCESS_TOKEN }, { guildId: guildId })

        const link = await linkWithGithub(GITHUB_ACCESS_TOKEN, owner, repoName, webhook);
        if(link) {
            console.log("Integrated with github");
        }

        if (!isAuthenticated) {
            message.reply({ content: "Not authenticated!. Please use !settoken <GITHUB_PERSONAL_ACCESS_TOKEN> command to authorize" })
        }
        else if (validateUrl) {
            message.reply({
                content: "This repository is already being tracked"
            })
        }

        else {
            const newUser = new User({ guildId: guildId, channelId: channelId, repoUrl: repoUrl, repoName: repoName, owner: owner, webHook: webhook })

            const userSave = await newUser.save();

            if (userSave) {
                message.reply({
                    content: "Tracking the repository: " + repoUrl
                })
            }

        }
    }
    else if (message.content.startsWith("!getCommits")) {

        try {
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
        } catch (error) {
            console.log(error);
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
                    message.reply({ content: prs });
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

