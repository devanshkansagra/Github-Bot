const { Octokit } = require("@octokit/rest");
const createWebHook = async (client, channelId, name) => {
  try {
    const channel = await client.channels.fetch(channelId);
    const webhook = await channel.createWebhook({ name: name });
    if (webhook) {
      let { url, id } = webhook;
      return { url, id };
    }
  } catch (error) {
    console.log("Error: ", error);
  }
};

const getGithubWebHook = async (gitToken, owner, repoName) => {
  const octokit = new Octokit({ auth: gitToken });
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/hooks", {
      repo: repoName,
      owner: owner,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteWebHook = async (client, webhookId, guildId) => {
  const guild = await client.guilds.cache.get(guildId);
  const webhooks = await guild.fetchWebhooks();

  try {
    const webhook = webhooks.get(webhookId);
    if (webhook) {
      const deleteHook = await webhook.delete();
      return deleteHook;
    } else {
      console.log("Webhook not found");
    }
  } catch (error) {
    console.log(error);
  }
};

const linkWithGithub = async (gitToken, owner, repoName, webhookURL) => {
  const octokit = new Octokit({ auth: gitToken });
  try {
    const link = await octokit.request("POST /repos/{owner}/{repo}/hooks", {
      owner: owner,
      repo: repoName,
      name: "web",
      events: ["push", "pull_request", "issues"],
      config: {
        url: webhookURL + "/github",
        content_type: "json",
        insecure_ssl: "0",
      },
    });
    if (link) {
      console.log("Integration successfull");
    }
  } catch (error) {
    console.log(error);
  }
};

const unlinkWithGithub = async (gitToken, owner, repoName, hookId) => {
  const octokit = new Octokit({ auth: gitToken });
  return await octokit.request("DELETE /repos/{owner}/{repo}/hooks/{hook_id}", {
    repo: repoName,
    owner: owner,
    hook_id: hookId,
  });
};

module.exports = {
    createWebHook,
    deleteWebHook,
    linkWithGithub,
    getGithubWebHook,
    unlinkWithGithub
}