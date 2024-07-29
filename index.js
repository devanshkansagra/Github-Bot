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
const auth = require("./commands/auth");
const track = require("./commands/track");
const untrack = require("./commands/untrack");
const issue = require("./commands/issue");

const createIssue = require("./controllers/createIssue");

const {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

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
    if (interaction.commandName === "authorize") {
      const modal = new ModalBuilder()
        .setCustomId("authorize")
        .setTitle("Authorize your github account");

      const accessToken = new TextInputBuilder()
        .setCustomId("accessToken")
        .setLabel("Github Access Token")
        .setStyle(TextInputStyle.Short);

      const tokenRow = new ActionRowBuilder().addComponents(accessToken);

      modal.addComponents(tokenRow);

      await interaction.showModal(modal);
    }
    if (interaction.commandName === "track") {
      const repoUrl = interaction.options.data[0].value;
      const guildId = interaction.guildId;
      const channelId = interaction.channelId;
      const repoName = repoUrl.split("/").pop();

      const owner = new URL(repoUrl).pathname.split("/")[1];

      try {
        const validateUrl = await User.findOne({ repoUrl: repoUrl });
        const isAuthenticated = await TokenDoc.findOne({ guildId: guildId });

        if (!isAuthenticated) {
          interaction.reply("You are not authorized");
        }
        if (validateUrl) {
          interaction.reply("This repository is already being tracked");
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
            interaction.reply("Tracking the repository: " + repoName);
          } else {
            interaction.reply("Unable to track the repository");
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (interaction.commandName === "commits") {
      try {
        const repository = interaction.options.data[0].value
          .split("/")[1]
          .toString();
        const owner = interaction.options.data[0].value
          .split("/")[0]
          .toString();
        const repoName = interaction.options.data[0].value.toString();
        let repo = await User.findOne({ repoName: repository, owner: owner });
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
        const owner = interaction.options.data[0].value
          .split("/")[0]
          .toString();
        const repoName = interaction.options.data[0].value.toString();
        let repo = await User.findOne({ repoName: repository, owner: owner });
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
        const owner = interaction.options.data[0].value
          .split("/")[0]
          .toString();
        const repoName = interaction.options.data[0].value.toString();
        let repo = await User.findOne({ repoName: repository, owner: owner });
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
    if (interaction.commandName === "issue") {
      const modal = new ModalBuilder()
        .setCustomId("issue")
        .setTitle("Create a new issue");

      const repository = new TextInputBuilder()
        .setCustomId("repository")
        .setLabel("Repository name (Username/RepoName)")
        .setStyle(TextInputStyle.Short);

      const issueTitle = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("Issue title")
        .setStyle(TextInputStyle.Short);

      const issueDescription = new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Issue Description")
        .setStyle(TextInputStyle.Paragraph);

      const issueLabel = new TextInputBuilder()
        .setCustomId("label")
        .setLabel("Issue Label")
        .setStyle(TextInputStyle.Short);

      const repoAction = new ActionRowBuilder().addComponents(repository);
      const titleAction = new ActionRowBuilder().addComponents(issueTitle);
      const descAction = new ActionRowBuilder().addComponents(issueDescription);
      const labelAction = new ActionRowBuilder().addComponents(issueLabel);

      modal.addComponents(repoAction, titleAction, descAction, labelAction);

      await interaction.showModal(modal);
    }
    if (interaction.commandName === "untrack") {
      const repoName = interaction.options.data[0].value.split("/")[1];
      const guildId = interaction.guildId;
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

          deleteWebHook(client, webhookId, guildId);
          unlinkWithGithub(
            token.accessToken,
            repo.owner,
            repoName,
            githubHookId[0].id,
          );

          await User.deleteOne({ webHook: webhookId });
          interaction.reply("Repository is untracked");
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  else if (interaction.customId === "issue") {
    const repository = interaction.fields.getTextInputValue("repository");
    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");
    const label = interaction.fields.getTextInputValue("label").split(",");

    try {
      const repoName = repository.split("/")[1];
      const owner = repository.split("/")[0];
      const token = await TokenDoc.find({ guildId: interaction.guildId });
      if (token) {
        const authToken = token[0].accessToken;
        const res = await createIssue(
          title,
          description,
          label,
          owner,
          repoName,
          authToken,
        );
        if (res) {
          interaction.reply("Issue Created");
        }
      } else {
        console.log("Token not fetched");
      }
    } catch (error) {
      console.log(error);
    }
  } else if (interaction.customId === "authorize") {
    const token = interaction.fields.getTextInputValue("accessToken");
    const guildId = interaction.guildId;

    const validateToken = await TokenDoc.findOne({ accessToken: token });
    if (validateToken) {
      interaction.reply("You are already authorized");
    } else {
      const newToken = new TokenDoc({ guildId: guildId, accessToken: token });
      const saveToken = await newToken.save();
      if (saveToken) {
        interaction.reply("You are authorized successfully");
      } else {
        interaction.reply("Unable to authorize");
      }
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  else if (message.content === "Hi") {
    message.reply({
      content: `Hi! ${message.author.username}`,
    });
  }
});

const rest = new REST({ version: "10" }).setToken(process.env.RESET_TOKEN);
(async () => {
  const commands = [commits, pulls, issues, auth, track, untrack, issue];
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
