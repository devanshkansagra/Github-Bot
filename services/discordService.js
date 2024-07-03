const createWebHook = async (client, channelId, name) => {
    try {
      const channel = await client.channels.fetch(channelId);
      const webhook = await channel.createWebhook({ name: name });
      if (webhook) {
        let { url, id } = webhook;
        return { url, id };
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };
  
  const deleteWebHook = async (client, webhookId, guildId) => {
    const guild = await client.guilds.cache.get(guildId);
    const webhooks = await guild.fetchWebhooks();
  
    try {
      const webhook = webhooks.get(webhookId);
      if (webhook) {
        const deleteHook = await webhook.delete();
        return deleteHook;
      } else {
        console.log("Webhook not found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  module.exports = {
    createWebHook,
    deleteWebHook,
  };
  