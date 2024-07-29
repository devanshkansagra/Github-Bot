const { Octokit } = require("@octokit/rest");

const createIssue = async (
  title,
  description,
  label,
  owner,
  repoName,
  authToken,
) => {
  try {
    const octokit = new Octokit({ auth: authToken });
    const response = await octokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner: owner,
        repo: repoName,
        title: title,
        body: description,
        labels: label,
      },
    );

    return response;
  } catch (error) {
    console.log("Error: ", error);
  }
};

module.exports = createIssue;
