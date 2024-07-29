const { SlashCommandBuilder } = require("discord.js");

const issue = new SlashCommandBuilder()
  .setName("issue")
  .setDescription("Create an issue");

module.exports = issue.toJSON();
