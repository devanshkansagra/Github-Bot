const { SlashCommandBuilder } = require("discord.js");

const commits = new SlashCommandBuilder()
  .setName("commits")
  .setDescription("Fetches the overall commits of the repository")
  .addStringOption((option) =>
    option
      .setName("repository")
      .setDescription("Username/RepositoryName")
      .setRequired(true)
  );

module.exports = commits.toJSON();
