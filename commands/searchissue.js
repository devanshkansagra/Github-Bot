const { SlashCommandBuilder } = require("discord.js");

const searchissue = new SlashCommandBuilder()
  .setName("searchissue")
  .setDescription("Fetches overall issues of the repository")
  .addStringOption((option) =>
    option
      .setName("repository")
      .setDescription("Username/RepositoryName")
      .setRequired(true),
  )
  .addNumberOption((option) =>
    option
      .setName("issue_number")
      .setDescription("issueid")
      .setRequired(true),
  );

module.exports = searchissue.toJSON();
