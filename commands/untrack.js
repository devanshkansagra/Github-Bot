const { SlashCommandBuilder } = require("discord.js");

const untrack = new SlashCommandBuilder()
  .setName("untrack")
  .setDescription("Untracks the GitHub repository")
  .addStringOption((option) =>
    option
      .setName("repository")
      .setDescription("Username/RepositoryName")
      .setRequired(true),
  );

module.exports = untrack.toJSON();
