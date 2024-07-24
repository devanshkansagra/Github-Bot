const { SlashCommandBuilder } = require("discord.js");

const issues = new SlashCommandBuilder()
  .setName("issues")
  .setDescription("Fetches overall issues of the repository")
  .addStringOption((option) =>
    option
      .setName("repository")
      .setDescription("Username/RepositoryName")
      .setRequired(true),
  );

module.exports = issues.toJSON();
