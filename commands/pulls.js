const { SlashCommandBuilder } = require("discord.js");

const pulls = new SlashCommandBuilder()
  .setName("pulls")
  .setDescription("Fetches overall pull requests of the repository")
  .addStringOption((option) =>
    option
      .setName("repository")
      .setDescription("Username/RepositoryName")
      .setRequired(true),
  );

module.exports = pulls.toJSON();
