const { SlashCommandBuilder } = require("discord.js");

const track = new SlashCommandBuilder()
  .setName("track")
  .setDescription("Tracks the github repository")
  .addStringOption((option) =>
    option
      .setName("repository-url")
      .setDescription("Github Repository URL")
      .setRequired(true),
  );

module.exports = track.toJSON();
