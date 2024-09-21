const { EmbedBuilder } = require("discord.js");

// inside a command, event listener, etc.
const issueEmbed = (html_url, num, title, by, state, avatar, body) => {
  return new EmbedBuilder()
    .setColor(0x32cd32)
    .setTitle("#" + num + " - " + title)
    .setURL(html_url)
    .setAuthor({
      name: by,
      iconURL: avatar,
      url: `https://github.com/${by}`,
    })
    .setDescription(body)
    .addFields({
      name: "Status",
      value: state,
      inline: true,
    });
};

module.exports = issueEmbed;
