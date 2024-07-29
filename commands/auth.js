const { SlashCommandBuilder } = require("discord.js");

const auth = new SlashCommandBuilder()
  .setName("authorize")
  .setDescription("Authorize your GitHub Account");
module.exports = auth.toJSON();
