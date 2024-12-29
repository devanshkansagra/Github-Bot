const { Octokit } = require("@octokit/rest");

const searchIssueController = async (repo, owner, issue_number, token) => {
  const octokit = new Octokit({
    auth: token,
  });

  return await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}",
    {
      owner: owner,
      repo: repo,
      issue_number: issue_number,
    }
  );
};

module.exports = searchIssueController;
