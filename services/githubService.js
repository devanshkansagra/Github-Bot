const { Octokit } = require("@octokit/rest");

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
      console.log("Integration successful");
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

module.exports = {
  linkWithGithub,
  unlinkWithGithub,
  getGithubWebHook,
};
