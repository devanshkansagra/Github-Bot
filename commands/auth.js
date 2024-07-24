const { SlashCommandBuilder } = require("discord.js");

const auth = new SlashCommandBuilder()
  .setName("authorize")
  .setDescription("Authorize your GitHub Account")
  .addStringOption((option) =>
    option
      .setName("access-token")
      .setDescription("Github Access Token")
      .setRequired(true),
  );

module.exports = auth.toJSON();
