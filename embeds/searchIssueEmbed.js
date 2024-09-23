const { EmbedBuilder } = require("discord.js");

// inside a command, event listener, etc.
const searchIssueEmbed = (html_url, num, title, by, state, avatar, body) => {
    let color;
    if (state === "merged") {
        color = 0x800080; // Purple color for merged state
    } else if (state === "open") {
        color = 0x32cd32; // Green color for open state
    } else {
        color = 0xff0000; // Red color for other states (e.g., closed)
    }
  return new EmbedBuilder()
    .setColor(color)
    .setTitle("Issue: " + "#" + num + " - " + title)
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

module.exports = searchIssueEmbed;
