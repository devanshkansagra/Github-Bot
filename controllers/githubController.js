const { Octokit } = require("@octokit/rest");

const getGithubWebHook = async (req, res) => {
  const { gitToken, owner, repoName } = req.body;
  const octokit = new Octokit({ auth: gitToken });

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/hooks", {
      repo: repoName,
      owner: owner,
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getGithubWebHook,
};
