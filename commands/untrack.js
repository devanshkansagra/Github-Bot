const { SlashCommandBuilder } = require("discord.js");

const untrack = new SlashCommandBuilder()
  .setName("untrack")
  .setDescription("untracks the GitHub Repository")
  .addStringOption((option) =>
    option
      .setName("repository-name")
      .setDescription("Username/RepositoryName")
      .setRequired(true),
  );

module.exports = untrack.toJSON();
