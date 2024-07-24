const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("./models/user");

const bodyParser = require("body-parser");

const {
  createWebHook,
  deleteWebHook,
  linkWithGithub,
  getGithubWebHook,
  unlinkWithGithub,
} = require("./functions/webhookFunctions");

const commits = require("./commands/commits");
const pulls = require("./commands/pulls");
const issues = require("./commands/issues");

const { REST, Routes, Client, GatewayIntentBits } = require("discord.js");
const TokenDoc = require("./models/tokenSchema");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const app = express();

const corsOptions = {
  origin: "http://api.github.com/",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

dotenv.config({ path: "./.env" });

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => {
    console.log("Databse connected Successfully");
  })
  .catch((error) => {
    console.log(error);
  });

client.once("ready", () => {
  console.log("Client is ready");
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "commits") {
      try {
        const repository = interaction.options.data[0].value
          .split("/")[1]
          .toString();
        const repoName = interaction.options.data[0].value.toString();
        let repo = await User.findOne({ repoName: repository });
        if (repo) {
          const response = await axios.get(
            `https://api.github.com/repos/${repoName}/commits`,
          );
          const data = await response.data;
          let commitList = "";
          data.forEach((entity) => {
            commitList += `commit ${entity.sha}\nCommit Message: ${entity.commit.message}\nAuthor: ${entity.commit.author.name}\nDate: ${entity.commit.committer.date}\n\n`;
          });
          if (commitList.length <= 2000) {
            interaction.reply(commitList);
          } else {
            const chunks = commitList.match(/[\s\S]{1,2000}/g);
            for (const chunk of chunks) {
              await interaction.reply(chunk);
            }
          }
        } else {
          interaction.reply("No repository found!!!");
        }
      } catch (error) {
        console.log("Error", error);
      }
    }
    if (interaction.commandName === "pulls") {
      try {
        const repository = interaction.options.data[0].value
          .split("/")[1]
          .toString();
        const repoName = interaction.options.data[0].value.toString();
        let repo = await User.findOne({ repoName: repository });
        if (repo) {
          const response = await axios.get(
            `https://api.github.com/repos/${repoName}/pulls`,
          );
          const data = await response.data;
          let prs = "";
          if (data) {
            if (data.length > 0) {
              data.forEach((entity) => {
                prs += `Pull Request number: ${entity.number} \nPull Request Title: ${entity.title} \nPull Request Body: ${entity.body} \nPull Request State: ${entity.state}\n\n`;
              });
            }
            if (prs.length <= 2000) {
              interaction.reply(prs);
            } else {
              const chunks = prs.match(/[\s\S]{1,2000}/g);
              for (const chunk of chunks) {
                await interaction.reply(chunk);
              }
            }
          }
        } else {
          interaction.reply("No repository found!!!");
        }
      } catch (error) {
        console.log("Error", error);
      }
    }
    if (interaction.commandName === "issues") {
      try {
        const repository = interaction.options.data[0].value
          .split("/")[1]
          .toString();
        const repoName = interaction.options.data[0].value.toString();
        let repo = await User.findOne({ repoName: repository });
        if (repo) {
          const response = await axios.get(
            `https://api.github.com/repos/${repoName}/issues`,
          );
          const data = await response.data;
          let issuesList = "";
          if (data) {
            if (data.length > 0) {
              data.forEach((entity) => {
                issuesList += `Created By: ${entity.user.login}\nIssue number: ${entity.number} \nIssue Title: ${entity.title} \nIssue Body: ${entity.body}\nCreated At: ${entity.created_at}\nUpdated At: ${entity.updated_at}\nState: ${entity.state}\n\n`;
              });
            }
            if (issuesList.length <= 2000) {
              interaction.reply(issuesList);
            } else {
              const chunks = issuesList.match(/[\s\S]{1,2000}/g);
              for (const chunk of chunks) {
                await interaction.reply(chunk);
              }
            }
          }
        } else {
          interaction.reply("No repository found!!!");
        }
      } catch (error) {
        console.log("Error", error);
      }
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!settoken")) {
    const token = message.content.split(" ")[1];

    const guildId = message.guildId;

    const validateToken = await TokenDoc.findOne({ accessToken: token });
    if (validateToken) {
      message.reply({ content: "Token is set already" });
    } else {
      const newToken = new TokenDoc({ guildId: guildId, accessToken: token });
      const saveToken = await newToken.save();
      if (saveToken) {
        message.reply({
          content:
            "Github access token is set successfully, you are authorized!",
        });
      } else {
        message.reply({
          content: "Unable to set the access token",
        });
      }
    }
  }

  if (message.content.startsWith("!track")) {
    let repoUrl = message.content.split(" ")[1];
    let guildId = message.guildId;
    let channelId = message.channelId;
    let repoName = repoUrl.split("/").pop();

    const owner = new URL(repoUrl).pathname.split("/")[1];

    try {
      const validateUrl = await User.findOne({ repoUrl: repoUrl });

      const isAuthenticated = await TokenDoc.findOne({ guildId: guildId });

      if (!isAuthenticated) {
        message.reply({
          content:
            "Not authenticated!. Please use !settoken <GITHUB_PERSONAL_ACCESS_TOKEN> command to authorize",
        });
      } else if (validateUrl) {
        message.reply({
          content: "This repository is already being tracked",
        });
      } else {
        const webhook = await createWebHook(client, channelId, repoName);

        const link = await linkWithGithub(
          isAuthenticated.accessToken,
          owner,
          repoName,
          webhook.url,
        );
        if (link) {
          console.log("Integrated with github");
        }

        const newUser = new User({
          guildId: guildId,
          channelId: channelId,
          repoUrl: repoUrl,
          repoName: repoName,
          owner: owner,
          webHook: webhook.id,
        });

        const userSave = await newUser.save();

        if (userSave) {
          message.reply({
            content: "Tracking the repository: " + repoName,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else if (message.content.startsWith("!untrack")) {
    try {
      const repoName = message.content.split(" ")[1];
      const guildId = message.guildId;
      try {
        const repo = await User.findOne({
          repoName: repoName,
          guildId: guildId,
        });
        const token = await TokenDoc.findOne({ guildId: guildId });
        if (repo) {
          const webhookId = repo.webHook;

          const githubHookId = await getGithubWebHook(
            token.accessToken,
            repo.owner,
            repoName,
          );

          await deleteWebHook(client, webhookId, guildId);

          await unlinkWithGithub(
            token.accessToken,
            repo.owner,
            repoName,
            githubHookId[0].id,
          );

          await User.deleteOne({ webHook: webhookId });
          message.reply({ content: "Repository is untracked" });
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {}
  } else if (message.content === "Hi") {
    message.reply({
      content: `Hi! ${message.author.username}`,
    });
  }
});

const rest = new REST({ version: "10" }).setToken(process.env.RESET_TOKEN);
(async () => {
  const commands = [commits, pulls, issues];
  try {
    console.log("Started refreshing application (/) commands.");
    const guildId = process.env.GUILD_ID;
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
      {
        body: commands,
      },
    );
    client.login(process.env.RESET_TOKEN);
  } catch (err) {
    console.log(err);
  }
})();

app.listen(3000, () => {
  console.log("Server started");
});
