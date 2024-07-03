const TokenDoc = require("../models/tokenSchema");
const User = require("../models/user");
const { createWebHook } = require("../utils/createWebHook");
const { deleteWebHook } = require("../utils/deleteWebHook");
const {
  linkWithGithub,
  unlinkWithGithub,
  getGithubWebHook,
} = require("../services/githubService");

const handleMessage = async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!settoken")) {
    await handleSetToken(message);
  } else if (message.content.startsWith("!track")) {
    await handleTrack(message);
  } else if (message.content.startsWith("!getCommits")) {
    await handleGetCommits(message);
  } else if (message.content.startsWith("!getIssues")) {
    await handleGetIssues(message);
  } else if (message.content.startsWith("!getPullRequests")) {
    await handleGetPullRequests(message);
  } else if (message.content.startsWith("!untrack")) {
    await handleUntrack(message);
  } else if (message.content === "Hi") {
    message.reply({
      content: `Hi! ${message.author.username}`,
    });
  }
};

const handleSetToken = async (message) => {
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
        content: "Github access token is set successfully, you are authorized!",
      });
    } else {
      message.reply({
        content: "Unable to set the access token",
      });
    }
  }
};

const handleTrack = async (message) => {
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
      const webhook = await createWebHook(channelId, repoName);

      const link = await linkWithGithub(
        isAuthenticated.accessToken,
        owner,
        repoName,
        webhook.url
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
};

const handleGetCommits = async (message) => {
  try {
    let repoName = message.content.split(" ")[1];
    let repo = await User.findOne({ repoName: repoName });
    if (repo) {
      let owner = repo.owner;
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/commits`
      );
      const data = await response.data;
      if (response) {
        let commits = "";
        if (data.length > 0) {
          data.forEach((entity) => {
            commits += `Commit Message: ${entity.commit.message} \nAuthor: ${entity.author.login}\n\n`;
          });
        }

        if (commits.length <= 2000) {
          message.reply({ content: commits });
        } else {
          const chunks = commits.match(/[\s\S]{1,2000}/g);
          for (const chunk of chunks) {
            await message.reply({ content: chunk });
          }
        }
      }
    } else {
      message.reply({ content: "No Repository found!!!" });
    }
  } catch (error) {
    console.log(error);
  }
};

const handleGetIssues = async (message) => {
  let repoName = message.content.split(" ")[1];
  let repo = await User.findOne({ repoName: repoName });

  if (repo) {
    let owner = repo.owner;
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/issues`
    );
    const data = await response.data;
    let issues = "";
    if (data) {
      if (data.length > 0) {
        data.forEach((entity) => {
          issues += `Issue number: ${entity.number} \nIssue Title: ${entity.title} \nIssue Body: ${entity.body}\n\n`;
        });
      }

      if (issues.length <= 2000) {
        message.reply({ content: issues });
      } else {
        const chunks = issues.match(/[\s\S]{1,2000}/g);
        for (const chunk of chunks) {
          await message.reply({ content: chunk });
        }
      }
    }
  } else {
    message.reply({
      content: "No Repository found!!!",
    });
  }
};

const handleGetPullRequests = async (message) => {
  let repoName = message.content.split(" ")[1];

  try {
    let repo = await User.findOne({ repoName: repoName });
    if (repo) {
      let owner = repo.owner;
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/pulls`
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
          message.reply({ content: prs });
        } else {
          const chunks = prs.match(/[\s\S]{1,2000}/g);
          for (const chunk of chunks) {
            await message.reply({ content: chunk });
          }
        }
      }
    } else {
      message.reply({
        content: "No Repository found!!!",
      });
    }
  } catch (error) {
    message.reply({
      content: "No Pull requests in this repository",
    });
  }
};

const handleUntrack = async (message) => {
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
          repoName
        );

        await deleteWebHook(webhookId, guildId);

        await unlinkWithGithub(
          token.accessToken,
          repo.owner,
          repoName,
          githubHookId[0].id
        );

        await User.deleteOne({ webHook: webhookId });
        message.reply({ content: "Repository is untracked" });
      }
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handleMessage,
};
